const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Game",
  tableName: "games",
  columns: {
    id: {
      primary: true,
      type: "int",
      unsigned: true,
      generated: true
    },
    title: {
      type: "varchar",
      length: 200,
      nullable: false
    },
    slug: {
      type: "varchar",
      length: 191,
      nullable: true,
      unique: true
    },
    description: {
      type: "text",
      nullable: true
    },
    price: {
      type: "decimal",
      precision: 8,
      scale: 2,
      nullable: false
    },
    imageUrl: {
      type: "varchar",
      length: 191,
      nullable: true
    },
    screenShots: {
      type: "json",
      nullable: true
    },
    category: {
      type: "varchar",
      length: 100,
      nullable: false
    },
    releaseDate: {
      type: "date",
      nullable: true
    },
    publisher: {
      type: "varchar",
      length: 100,
      nullable: true
    },
    developer: {
      type: "varchar",
      length: 100,
      nullable: true
    },
    rating: {
      type: "decimal",
      precision: 3,
      scale: 2,
      default: 0.00
    },
    ratingCount: {
      type: "int",
      unsigned: true,
      default: 0
    },
    stock: {
      type: "int",
      unsigned: true,
      default: 0
    },
    unitsSold: {
      type: "int",
      unsigned: true,
      default: 0
    },
    viewsCount: {
      type: "int",
      unsigned: true,
      default: 0
    },
    active: {
      type: "boolean",
      default: true
    },
    featured: {
      type: "boolean",
      default: false
    },
    discount: {
      type: "decimal",
      precision: 3,
      scale: 2,
      default: 0.00
    },
    tags: {
      type: "json",
      nullable: true
    },
    trailerUrl: {
      type: "varchar",
      length: 191,
      nullable: true
    },
    ageRating: {
      type: "varchar",
      length: 10,
      nullable: true
    },
    systemRequirements: {
      type: "json",
      nullable: true
    },
    language: {
      type: "varchar",
      length: 100,
      default: "Spanish"
    },
    size: {
      type: "varchar",
      length: 20,
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
  indices: [
    {
      name: "idx_active_featured",
      columns: ["active", "featured"]
    },
    {
      name: "idx_category_active",
      columns: ["category", "active"]
    },
    {
      name: "idx_slug",
      columns: ["slug"]
    }
  ]
});