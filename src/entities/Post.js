const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Post",
  tableName: "posts",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
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
    isEdited: {
      type: "boolean",
      default: false,
    },
    likes: {
      type: "int",
      default: 0,
    },
    isAcceptedAnswer: {
      type: "boolean",
      default: false,
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
    thread: {
      type: "many-to-one",
      target: "Thread",
      joinColumn: {
        name: "threadId",
      },
      onDelete: "CASCADE",
    },
  },
})
