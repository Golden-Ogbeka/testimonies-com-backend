module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Add isSecret: false to all existing testimonies that don't have this field
    await db
      .collection("testimonies")
      .updateMany(
        { isSecret: { $exists: false } },
        { $set: { isSecret: false } },
      );

    console.log("Added isSecret: false to existing testimonies");
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // Remove isSecret field from all testimonies
    await db
      .collection("testimonies")
      .updateMany({}, { $unset: { isSecret: "" } });

    console.log("Removed isSecret field from testimonies");
  },
};
