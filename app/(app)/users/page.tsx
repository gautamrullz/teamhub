import { getUsers } from "@/lib/services/users";

import CreateUserForm from "./CreateUserForm";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <main className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>

        <p className="mt-2 text-muted-foreground">
          Manage users in your organization.
        </p>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Create User</h2>

          <p className="text-sm text-muted-foreground">
            Add an admin or staff member to your organization.
          </p>
        </div>

        <CreateUserForm />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Organization Users</h2>

        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users found.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{user.name ?? "—"}</td>

                    <td className="px-4 py-3">{user.email}</td>

                    <td className="px-4 py-3">{user.role}</td>

                    <td className="px-4 py-3">
                      {user.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
