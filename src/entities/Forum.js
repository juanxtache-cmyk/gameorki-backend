const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Forum",
  tableName: "forums",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
      length: 100,
    },
    description: {
      type: "text",
      nullable: true,
    },
    icon: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    createdAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    threads: {
      type: "one-to-many",
      target: "Thread",
      inverseSide: "forum",
    },
  },
})
