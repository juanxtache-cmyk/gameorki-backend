const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Thread",
  tableName: "threads",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    title: {
      type: "varchar",
      length: 255,
    },
    content: {
      type: "text",
    },
    createdAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    updatedAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
    },
    viewCount: {
      type: "int",
      default: 0,
    },
    isPinned: {
      type: "boolean",
      default: false,
    },
    isLocked: {
      type: "boolean",
      default: false,
    },
    tags: {
      type: "simple-json",
      nullable: true,
    },
  },
  relations: {
    author: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "authorId",
      },
      onDelete: "CASCADE",
    },
    forum: {
      type: "many-to-one",
      target: "Forum",
      joinColumn: {
        name: "forumId",
      },
      onDelete: "CASCADE",
    },
    posts: {
      type: "one-to-many",
      target: "Post",
      inverseSide: "thread",
    },
  },
})
