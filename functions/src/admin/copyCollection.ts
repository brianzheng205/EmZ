import { getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

/**
 * Copy all documents from one collection to another.
 * Query Parameters:
 * - from: Source collection name
 * - to: Destination collection name
 */
const copyCollection = onRequest(async (req, res) => {
  // Debug logging to understand shell behavior
  logger.info("Request Details", {
    query: req.query,
    body: req.body,
    headers: req.headers,
    method: req.method,
  });

  // Try to find parameters in various places
  const sourceCollection = (req.query?.from ||
    req.body?.from ||
    req.body?.data?.from) as string;
  const destCollection = (req.query?.to ||
    req.body?.to ||
    req.body?.data?.to) as string;

  if (!sourceCollection || !destCollection) {
    res.status(400).json({
      error: "Missing 'from' or 'to' parameters.",
      help: "Pass parameters via query string usually works best in shell, or use curl.",
      received: { query: req.query, body: req.body },
    });
    return;
  }

  const db = getFirestore();
  const sourceRef = db.collection(sourceCollection);
  const destRef = db.collection(destCollection);

  try {
    const sourceSnapshot = await sourceRef.get();

    if (sourceSnapshot.empty) {
      res.status(404).json({
        error: `Source collection '${sourceCollection}' is empty or does not exist.`,
      });
      return;
    }

    // 1. DELETE EXISTING DOCUMENTS IN DESTINATION
    logger.info(`Deleting existing documents in ${destCollection}...`);
    const destSnapshot = await destRef.get();
    const batchSize = 500;

    // Delete in batches
    if (!destSnapshot.empty) {
      let deleteBatch = db.batch();
      let deleteCount = 0;
      for (const doc of destSnapshot.docs) {
        deleteBatch.delete(doc.ref);
        deleteCount++;
        if (deleteCount >= batchSize) {
          await deleteBatch.commit();
          deleteBatch = db.batch();
          deleteCount = 0;
        }
      }
      if (deleteCount > 0) {
        await deleteBatch.commit();
      }
      logger.info(`Deleted all existing documents in ${destCollection}`);
    }

    // 2. COPY NEW DOCUMENTS
    logger.info(
      `Copying documents from ${sourceCollection} to ${destCollection}...`,
    );
    let copyBatch = db.batch();
    let copyCount = 0;
    let totalCopied = 0;

    for (const doc of sourceSnapshot.docs) {
      const data = doc.data();
      const newDocRef = destRef.doc(doc.id);

      copyBatch.set(newDocRef, data);
      copyCount++;
      totalCopied++;

      if (copyCount >= batchSize) {
        await copyBatch.commit();
        copyBatch = db.batch();
        copyCount = 0;
      }
    }

    if (copyCount > 0) {
      await copyBatch.commit();
    }

    logger.info(
      `Successfully copied ${totalCopied} documents from ${sourceCollection} to ${destCollection}`,
    );
    res.status(200).json({
      message: `Successfully replaced ${destCollection} with data from ${sourceCollection}`,
      copiedCount: totalCopied,
    });
  } catch (error) {
    logger.error("Error processing collection", error);
    res.status(500).json({ error: `Error processing collection: ${error}` });
  }
});

export default copyCollection;
