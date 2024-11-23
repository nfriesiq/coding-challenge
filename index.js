import { readFile } from "fs/promises";

function levenshteinDistance(source, target) {
  const distanceMatrix = Array.from({ length: source.length + 1 }, () =>
    Array(target.length + 1).fill(0)
  );

  for (let row = 0; row <= source.length; row++) {
    distanceMatrix[row][0] = row;
  }
  for (let col = 0; col <= target.length; col++) {
    distanceMatrix[0][col] = col;
  }

  for (let row = 1; row <= source.length; row++) {
    for (let col = 1; col <= target.length; col++) {
      if (source[row - 1] === target[col - 1]) {
        distanceMatrix[row][col] = distanceMatrix[row - 1][col - 1];
      } else {
        distanceMatrix[row][col] =
          Math.min(
            distanceMatrix[row - 1][col], // Deletion
            distanceMatrix[row][col - 1], // Insertion
            distanceMatrix[row - 1][col - 1] // Substitution
          ) + 1;
      }
    }
  }

  // Return the bottom-right value: The Levenshtein distance
  return distanceMatrix[source.length][target.length];
}

class TrieNode {
  constructor() {
    this.children = {};
    this.rowRefs = new Set();
  }
}

export class DataProcessor {
  rows = [];
  nameIndex = new Map();
  trieRoot = new TrieNode();

  async loadCSV(filepath) {
    const csvString = await readFile(filepath, { encoding: "utf-16le" });
    const lines = csvString.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("Invalid CSV: No data rows available.");
    }

    const headers = lines[0].split(","); // Extract headers from the first line

    // Map each subsequent line to an object
    const result = lines.slice(1).map((line) => {
      const values = line.split(","); // Split line into values
      return headers.reduce((acc, header, index) => {
        acc[header] = values[index]; // Map each header to its corresponding value
        return acc;
      }, {});
    });

    this.rows = result.map((r) => ({ ...r, id: Number(r.id) }));
    this.buildIndexes();
    return this.rows;
  }

  getImagesBySubjectIDs(subjectIDs) {
    if (!this.rows.length) {
      throw new Error("No data loaded. Please load a CSV first.");
    }

    const idsSet = new Set(subjectIDs.map(String));

    return this.rows
      .filter((row) => idsSet.has(row.id))
      .map((row) => ({ id: row.id, image_id: row.image_id }));
  }

  searchByName(query, options = { limit: 10 }) {
    const normalizedQuery = query.toLowerCase();
    const results = new Set();

    // Prefix matching via Trie
    const prefixMatches = this.searchInTrie(normalizedQuery);
    prefixMatches.forEach((row) => {
      if (options.limit > 0 && results.size < options.limit) {
        results.add(row);
      }
    });

    // If limit is reached by prefix matching, we can return early
    if (options.limit > 0 && results.size === options.limit) {
      return Array.from(results);
    }

    // Levenshtein fallback
    this.nameIndex.forEach((rows, token) => {
      const normalizedToken = token.toLowerCase();
      if (levenshteinDistance(normalizedToken, normalizedQuery) <= 1) {
        rows.forEach((row) => {
          if (options.limit > 0 && results.size < options.limit) {
            results.add(row);
          }
        });
      }
    });

    return Array.from(results);
  }

  /**      Private methods       **/

  buildIndexes() {
    this.nameIndex.clear();
    this.trieRoot = new TrieNode();

    this.rows.forEach((row) => {
      const tokens = row.name.split(/\s+/); // Tokenize by whitespace
      tokens.forEach((token) => {
        const lowerToken = token.toLowerCase(); // Normalize to lowercase

        // Add to nameIndex for Levenshtein fallback
        if (!this.nameIndex.has(lowerToken)) {
          this.nameIndex.set(lowerToken, new Set());
        }
        this.nameIndex.get(lowerToken).add(row);

        // Add to Trie for prefix matching
        this.insertIntoTrie(lowerToken, row);
      });
    });
  }

  insertIntoTrie(token, row) {
    let node = this.trieRoot;
    for (const char of token) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
      node.rowRefs.add(row);
    }
  }

  searchInTrie(prefix) {
    let node = this.trieRoot;
    for (const char of prefix) {
      if (!node.children[char]) {
        return new Set(); // No matches
      }
      node = node.children[char];
    }
    return Array.from(new Set(node.rowRefs));
  }
}
