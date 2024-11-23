import assert from "assert";
import { DataProcessor } from "./index.js";

// Helper function to simulate test runner
async function test(description, fn) {
  try {
    await fn();
    console.log(`✔ ${description}`);
  } catch (err) {
    console.error(`✖ ${description}`);
    console.error(err);
  }
}

(async () => {
  await test("Should return no results for non-existent IDs", async () => {
    const processor = new DataProcessor();
    await processor.loadCSV("./subject_images.csv");

    const imagesForNonExistentIDs = processor.getImagesBySubjectIDs([
      999, 1000,
    ]);
    assert.deepStrictEqual(imagesForNonExistentIDs, []);
  });

  await test("Should return correct images for given subject IDs", async () => {
    const processor = new DataProcessor();
    await processor.loadCSV("./subject_images.csv");

    const images = processor.getImagesBySubjectIDs([1, 101, 103]);
    assert.deepStrictEqual(images, [
      { id: 1, image_id: "img_093.jpg" },
      { id: 101, image_id: "img_013.jpg" },
      { id: 103, image_id: "img_009.jpg" },
    ]);
  });

  await test("Should return correct images for given name query", async () => {
    const processor = new DataProcessor();
    await processor.loadCSV("./subject_images.csv");

    const searchResult = processor.searchByName("Javl", { limit: 1 });

    assert.deepStrictEqual(searchResult, [
      {
        id: 104,
        name: "Jack",
        image_id: "img_040.jpg",
      },
    ]);
  });
})();
