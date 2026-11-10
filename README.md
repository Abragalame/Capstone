# MCPI Canteen – Appwrite deployment guide

Your existing app (ordering, QR tickets, staff dashboard, themes, accessibility) now runs on Appwrite
with real accounts, roles, 7 stalls and photo uploads. It is a **static site** – no Node build needed.

## Why you saw HTTP 503

`capstone.sgp.appwrite.run` was an Appwrite **Function** (status "Deployed: Never"). A function with no
deployment has nothing to serve, so it returns 503. A website must be created under **Sites**, not Functions.
Node 26 was not the problem. Delete that function and follow section 3.

## 1. Files (put these at the root of your GitHub repo)

```
index.html                    page shell (loads css + js in order)
logo.png, images/             YOUR existing files - keep them
css/    base.css (your original styles) · components.css · auth.css · student.css · staff.css · admin.css
js/
  config.js                   <- edit: Project ID, table/bucket IDs, stall names
  services/                   all Appwrite calls: auth · menu · orders · storage · admin
  core/                       state.js (your original state/helpers) · router.js (role-guarded routes)
  components/                 shared.js · qr-map.js · role-badge.js
  views/                      auth.welcome · auth.login · student · staff · admin
  controllers/                auth · student · staff · admin  (button actions)
  data/sample-menu.js         your original 18 dishes
  main.js                     start-up
functions/manage-users/       server function that lets the admin assign staff
```

Edit `js/config.js` and set `projectId`. The endpoint is already set to `https://sgp.cloud.appwrite.io/v1`
(taken from your `.sgp.` URL – change it if your project is in another region).

## 2. Appwrite Console setup

**a) Auth** – make sure Email/Password is enabled.

**b) Database** `canteen`

Table `menu_items`

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

Index: key on `stall`. Permissions: Read = **Any**; Create/Update/Delete = **Label `staff`** and **Label `admin`**.

Table `orders`

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

Index: key on `userId`. Settings: turn **Row security ON**. Table permissions: Create = **Users**;
Read + Update = **Label `staff`** and **Label `admin`**. (Each student gets read/update on their own order automatically.)

**c) Storage** bucket `menu_images`: Read = **Any**; Create/Update/Delete = Label `staff`, Label `admin`;
allowed extensions jpg, jpeg, png, webp, gif; max 5 MB.

**d) Function** `manage-users` (Functions → Create function)
- Runtime: Node.js 22 (or the newest LTS offered) · Entrypoint `src/main.js` · Build command `npm install`
- Root directory `functions/manage-users` (connect the same GitHub repo)
- Execute access: **Users** · Scopes: `users.read`, `users.write`
- Wait until its deployment shows **Ready**.

## 3. Deploy the website (Sites)

1. Delete the old **Capstone** function.
2. Console → **Sites → Create site → Connect Git** → pick your Capstone repo and `main` branch.
3. Framework **Other / static**, build command **empty** (if the form refuses, use `echo done`), output directory `./`.
4. Deploy and open the site's `*.appwrite.network` domain.
5. Project → **Overview → Platforms → Add platform → Web** → add that domain (otherwise login shows a CORS error).

## 4. Make yourself admin

1. Open the site → **Register** with your email.
2. Console → Auth → your user → **Labels** → add `admin` → Update. Log out and in again.
3. You land on the **Admin** page (top-right shows "Admin"). Click **Import sample menu** to load your original dishes.

## 5. How roles work

- Every registered account is a **Student** (top-right says "Student").
- Admin page → **Make staff**. That user's next visit opens the **Staff** dashboard instead, with "Staff" top-right.
- Staff: **Orders** tab (your original dashboard, live) and **Manage menu** tab (add / edit / delete dishes,
  choose Stall 1–7, upload a photo).
- Roles are Appwrite labels that browsers cannot change; permissions are enforced by Appwrite, not just hidden in the UI.

## Notes

- The Appwrite SDK loads from jsDelivr at its latest version. Once everything works you can pin it
  (`https://cdn.jsdelivr.net/npm/appwrite@<version>`) in `index.html`.
- Appwrite can't limit which fields a student may update on their own order row, so a technically skilled student
  could edit their own order. For a capstone this is acceptable; to harden it, move order status changes into the function.
- Your original CSS is kept untouched in `css/base.css` so nothing looks different; new role styles live in their own files.
