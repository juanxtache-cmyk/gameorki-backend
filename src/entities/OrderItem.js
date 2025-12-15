const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "OrderItem",
  tableName: "order_items",
  columns: {
    id: {
      primary: true,
      type: "int",
      unsigned: true,
      generated: true
    },
    orderId: {
      type: "int",
      unsigned: true,
      nullable: false
    },
    gameId: {
      type: "int",
      unsigned: true,
      nullable: false
    },
    gameTitle: {
      type: "varchar",
      length: 200,
      nullable: false
    },
    gameSlug: {
      type: "varchar",
      length: 191,
      nullable: true
    },
    quantity: {
      type: "tinyint",
      unsigned: true,
      default: 1
    },
    price: {
      type: "decimal",
      precision: 8,
      scale: 2,
      nullable: false
    },
    totalPrice: {
      type: "decimal",
      precision: 8,
      scale: 2,
      nullable: false
    },
    gameImage: {
      type: "varchar",
      length: 191,
      nullable: true
    },
    digitalKeyId: {
      type: "varchar",
      length: 36,
      nullable: true
    }
  },
  relations: {
    order: {
      target: "Order",
      type: "many-to-one",
      joinColumn: { name: "orderId" },
      onDelete: "CASCADE"
    },
    game: {
      target: "Game",
      type: "many-to-one",
      joinColumn: { name: "gameId" },
      onDelete: "RESTRICT"
    }
  },
  indices: [
    {
      name: "idx_order",
      columns: ["orderId"]
    },
    {
      name: "idx_game",
      columns: ["gameId"]
    }
  ]
});