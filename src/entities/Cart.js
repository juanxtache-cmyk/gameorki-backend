const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Cart",
  tableName: "carts",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    userId: {
      type: "int",
    },
    items: {
      type: "simple-json",
    },
    totalItems: {
      type: "int",
      default: 0,
    },
    totalPrice: {
      type: "float",
      default: 0,
    },
    updatedAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    user: {
      type: "one-to-one",
      target: "User",
      joinColumn: {
        name: "userId",
      },
      onDelete: "CASCADE",
    },
  },
})
