# MCPI Canteen – Appwrite setup guide

A static website (no build step) that runs on **Appwrite**: accounts, roles, orders, menu photos.

## Who can use the app

| Role | How they get it | What they see |
|---|---|---|
| **Student** | Registers → active immediately | Ordering pages (menu, cart, tracking, QR ticket) |
| **Teacher** | Registers as *Teacher* → **admin approves** | Same ordering pages as students (delivery to their classroom) |
| **Staff** | Registers as *Staff* → **admin approves** | Staff dashboard: live orders + manage menu, limited to their stall |
| **Admin** | Only another admin (or you in the Console) can grant it | Everything: Users page, staff dashboard, student view |

**Approval flow**

1. A teacher or staff member opens the site → **Register** → picks **Teacher** or **Staff**, fills in their Employee ID.
2. Their account is created but shows a **"Waiting for admin approval"** page. They cannot order or open the dashboard.
3. The admin opens **Users → Waiting for approval**, chooses the final role (**Teacher / Staff / Admin**, plus a **stall** for staff) and clicks **Approve** (or **Decline**).
4. The applicant's waiting page updates by itself within ~15 seconds and sends them to the right page.

Security note: privileges come only from Appwrite **user labels** (`admin`, `staff`, `teacher`, `stall1`…`stall7`). A browser cannot change labels – only the `manage-users` function (admin-only) or the Console can. The "pending" screen is driven by account *prefs*, which only decide what page to show, never what someone is allowed to do.

---

## 1. Project files

```
index.html
css/        base · components · auth · student · staff · admin
js/
  config.js                  <- you edit this (Project ID etc.)
  services/                  Appwrite calls: auth · menu · orders · storage · admin
  views/                     auth.login (register w/ Student/Teacher/Staff) · auth.pending · student · staff · admin
  controllers/               auth · student · staff · admin
  core/ components/ data/    router, state, shared UI, sample menu
functions/manage-users/      server function: approvals, roles, stalls
```

Push the whole folder to the **root** of a GitHub repo (`main` branch).

## 2. Appwrite Console setup

Create a project at <https://cloud.appwrite.io>. Note its **Project ID** and **region** (the endpoint is
`https://<region>.cloud.appwrite.io/v1`, e.g. `sgp`, `fra`, `nyc`).

### a) Auth
Auth → Settings → make sure **Email/Password** is enabled.

### b) Database `canteen`
Databases → Create database. **Database ID must be `canteen`.**

**Table `menu_items`** (ID `menu_items`)

| Column | Type | Notes |
|---|---|---|
| name | varchar 120 | required |
| description | text | |
| price | float | required, min 0 |
| stall | integer | required, min 1, max 7 |
| category | varchar 30 | required |
| emoji | varchar 8 | |
| status | varchar 8 | default `ok` |
| popular | boolean | default false |
| prepMin | integer | default 5 |
| imageId | varchar 36 | |
| legacyPhoto | varchar 80 | |
| createdBy | varchar 36 | |

- Index: **key** on `stall`.
- Permissions: Read = **Any**; Create / Update / Delete = **Label `staff`** and **Label `admin`**.

**Table `orders`** (ID `orders`)

| Column | Type | Notes |
|---|---|---|
| orderNo | varchar 20 | required |
| userId | varchar 36 | required |
| name | varchar 120 | |
| grade | integer | |
| mode | varchar 10 | |
| room | varchar 60 | |
| items | text | required |
| total | float | |
| pickTime | varchar 40 | |
| notes | text | |
| st | integer | default 0 |
| acc | boolean | default false |
| s1 … s7 | integer ×7 | one column per stall: min -1, max 3, default -1 |

(`s1`–`s7`: -1 = no items from that stall, 0 received, 1 preparing, 2 ready, 3 collected/delivered.)

- Index: **key** on `userId`.
- Settings: turn **Row security ON**.
- Table permissions: Create = **Users**; Read + Update = **Label `staff`** and **Label `admin`**.
  (Each student/teacher automatically gets read/update on their own orders.)

> Teachers need **no extra permissions** – they order like students (role "Users").

### c) Storage bucket `menu_images`
Bucket ID `menu_images`. Read = **Any**; Create / Update / Delete = **Label `staff`**, **Label `admin`**.
Allowed extensions: jpg, jpeg, png, webp, gif. Max size 5 MB.

### d) Function `manage-users`  ⚠ must be (re)deployed – it changed
This function does all admin actions (list users, **approve / decline**, change roles, assign stalls).

1. Functions → **Create function** → connect your GitHub repo.
2. Function ID: **`manage-users`**
3. Runtime: Node.js (newest LTS offered)
4. Root directory: `functions/manage-users`
5. Entrypoint: `src/main.js` · Build command: `npm install`
6. **Execute access: Users** (the function itself checks that the caller has the `admin` label).
7. **Scopes:** `users.read`, `users.write`
8. Deploy and wait until the deployment says **Ready**.

If you already had this function from the older version, just push the new code and **redeploy** – the new
`approve`, `decline` and `teacher/admin` role actions only exist in the new version. (Old symptom: the Users
page shows an error or "Unknown action".)

## 3. Edit `js/config.js`

```js
endpoint:  'https://sgp.cloud.appwrite.io/v1',  // match YOUR project's region
projectId: 'YOUR_PROJECT_ID',
databaseId: 'canteen',
tables: { menu: 'menu_items', orders: 'orders' },
bucketId: 'menu_images',
functionId: 'manage-users',
```
Rename the stalls in the `STALLS` list if you like (keep ids 1–7).

## 4. Deploy the website (Appwrite Sites)

> A website must be created under **Sites**, not Functions (a Function with no deployment returns HTTP 503).

1. Console → **Sites → Create site → Connect Git** → pick the repo and `main`.
2. Framework **Other / static**, build command empty (or `echo done`), output directory `./`.
3. Deploy and open the `*.appwrite.network` domain.
4. **Overview → Platforms → Add platform → Web** → add that domain (without it, login fails with a CORS error).

## 5. Create the first admin

Nobody can approve anyone until one admin exists, so do this once in the Console:

1. Open your site → **Register** as **Student** with your own email.
2. Console → **Auth → Users →** your user → **Labels** → add `admin` → **Update**.
3. Log out and back in. You land on the **Admin** page.
4. Click **Import sample menu** to load the 18 original dishes.

To make more admins later, use the approval screen (choose **Admin**) – the app asks you to confirm.
Admins can only be removed in the Console (Auth → user → Labels), which prevents accidental lock-out.

## 6. Test the whole flow (5 minutes)

1. Open the site in a private window → Register → **Teacher** (fill Employee ID, grade, room). You should see **Waiting for admin approval**.
2. Do it again with another email as **Staff**.
3. In your normal window (admin) open **Users**. Both appear under **Waiting for approval**.
4. Approve the teacher as **Teacher**; approve the staff member as **Staff** with **Stall 1**.
5. Back in the private window the page switches to the right home by itself (or press **Check again**).
   - Teacher → menu & ordering.
   - Staff → staff dashboard showing only Stall 1.
6. Declining shows the applicant "Request declined"; they can still tap **Use a student account instead**.

## 7. Day-to-day admin

- **Users → Waiting for approval**: approve / decline requests. A red number next to **Users** shows how many are waiting.
- **Users → All users**: change anyone's role (Student / Teacher / Staff / Admin) with the dropdown; staff also get a stall dropdown.
- Changing a role clears the old stall. Existing admins cannot be edited here.
- Users see their new role the next time they open or refresh the site.

## 8. How multi-stall orders work (unchanged)

An order is split per stall. Each stall moves only its own part: Received → Preparing → Ready → Handed over.
Pickup QR unlocks when any stall is ready; delivery waits until all stalls are ready.

## Troubleshooting

| Problem | Fix |
|---|---|
| "Setup needed: put your Appwrite Project ID" | Edit `js/config.js` |
| Login shows a CORS / "origin not allowed" error | Add your site's domain as a **Web platform** (step 4.4) |
| Users page says *Request failed / Unknown action / Server error* | Redeploy `manage-users` (step 2d); check scopes `users.read` + `users.write` and Execute access = Users |
| Users page says "Admins only" | Your account is missing the `admin` label (step 5) |
| Approved person still sees the waiting page | Press **Check again** or log out/in; confirm the Console shows the right label on their user |
| Staff can't add/edit dishes | Their user needs label `staff`; the `menu_items` table must allow Create/Update/Delete for Label `staff` |
| Orders don't save | `orders` table: Create = Users and Row security ON; check all 7 `s1…s7` columns exist |
| HTTP 503 on the site | You deployed a Function instead of a Site (step 4) |

## Known limits

- Appwrite can't restrict which fields a student updates on their own order row, so a technically skilled student could edit their own order. Fine for a capstone; to harden it, move status changes into a function.
- Per-stall menu limits are enforced in the interface, not by Appwrite.
- Approval requests are not emailed to the admin – the admin sees them (and the red badge) when they open the site.
- The Appwrite SDK loads from jsDelivr at its latest version; once everything works, pin a version in `index.html`.
