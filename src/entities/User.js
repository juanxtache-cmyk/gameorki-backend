const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    username: {
      type: "varchar",
      length: 100,
      unique: true,
    },    email: {
      type: "varchar",
      length: 100,
      unique: true,
    },
    firstName: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    lastName: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    password: {
      type: "varchar",
      length: 255,
    },    resetPasswordToken: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    resetPasswordExpires: {
      type: "timestamp",
      nullable: true,
    },
    resetPasswordCode: {
      type: "varchar",
      length: 6, // Código de 6 dígitos
      nullable: true,
    },
    resetPasswordCodeExpires: {
      type: "timestamp",
      nullable: true,
    },
    avatar: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    bio: {
      type: "text",
      nullable: true,
    },
    joinDate: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    role: {
      type: "varchar",
      length: 20,
      default: "user",
    },
  },
  relations: {
    threads: {
      type: "one-to-many",
      target: "Thread",
      inverseSide: "author",
    },
    posts: {
      type: "one-to-many",
      target: "Post",
      inverseSide: "author",
    },
  },
})
