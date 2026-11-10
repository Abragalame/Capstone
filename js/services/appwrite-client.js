/* One Appwrite client for the whole site. Everything else goes through js/services/*. */
const AW = (() => {
  const { Client, Account, TablesDB, Storage, Functions, ID, Query, Permission, Role, ExecutionMethod } = Appwrite;
  const client = new Client().setEndpoint(CONFIG.endpoint).setProject(CONFIG.projectId);
  return {
    client,
    account: new Account(client),
    db: new TablesDB(client),
    storage: new Storage(client),
    functions: new Functions(client),
    ID, Query, Permission, Role, ExecutionMethod,
  };
})();
