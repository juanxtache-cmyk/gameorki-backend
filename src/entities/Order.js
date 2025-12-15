const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Order",
  tableName: "orders",
  columns: {
    id: {
      primary: true,
      type: "int",
      unsigned: true,
      generated: true
    },
    orderNumber: {
      type: "varchar",
      length: 50,
      unique: true,
      nullable: false
    },
    userId: {
      type: "int",
      unsigned: true,
      nullable: false
    },
    userEmail: {
      type: "varchar",
      length: 100,
      nullable: false
    },
    userName: {
      type: "varchar",
      length: 100,
      nullable: false
    },
    status: {
      type: "enum",
      enum: ["pending", "processing", "completed", "cancelled", "refunded"],
      default: "pending"
    },
    paymentStatus: {
      type: "enum",
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending"
    },
    paymentMethod: {
      type: "varchar",
      length: 50,
      nullable: false
    },
    paymentId: {
      type: "varchar",
      length: 100,
      nullable: true
    },
    subtotal: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false
    },
    tax: {
      type: "decimal",
      precision: 8,
      scale: 2,
      default: 0.00
    },
    discount: {
      type: "decimal",
      precision: 8,
      scale: 2,
      default: 0.00
    },
    total: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false
    },
    totalAmount: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false
    },
    currency: {
      type: "char",
      length: 3,
      default: "USD"
    },
    billingAddress: {
      type: "json",
      nullable: true
    },
    notes: {
      type: "text",
      nullable: true
    },
    purchaseDate: {
      type: "timestamp",
      createDate: true
    },
    processedAt: {
      type: "timestamp",
      nullable: true
    },
    completedAt: {
      type: "timestamp",
      nullable: true
    },
    createdAt: {
      type: "timestamp",
      createDate: true
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true
    }
  },
  relations: {
    user: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "userId" },
      onDelete: "RESTRICT"
    },
    orderItems: {
      target: "OrderItem",
      type: "one-to-many",
      inverseSide: "order"
    }
  },
  indices: [
    {
      name: "idx_user_status",
      columns: ["userId", "status"]
    },
    {
      name: "idx_order_number",
      columns: ["orderNumber"]
    }
  ]
});