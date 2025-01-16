# Installation steps

1. Clone the repo
2. Add `css-data.json` to `CSS: Custom Data` in your VSC settings to get rid of pesky css warnings
3. Run `npm install`
4. Add a .env file (can be .env.local, but be advised prisma can't read this with env())
5. Add prettier if desired and a db driver/orm of your choice. I recommend prisma if you want an ORM, Kysely if you want a query builder, and pg if you're going spartan with raw sql or stored procedures.
6. Configure eslint and tsconfig if you have opinions about it (Let me know if you want my opinions)
7. If your project needs it, add state management. I recommend zustand for top down contexts, and jotai for bottom up atoms.
