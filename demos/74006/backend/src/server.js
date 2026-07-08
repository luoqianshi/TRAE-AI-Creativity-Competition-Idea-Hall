const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const helmet = require("helmet");
const multer = require("multer");
const { ethers } = require("ethers");

const contractAbi = require("./contractAbi");

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `${Date.now()}-${safeName}`);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/files", express.static(uploadDir));

function sha256File(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return `sha256:${hash.digest("hex")}`;
}

function sha256Json(value) {
  return `sha256:${crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}

function getContract() {
  const { RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS } = process.env;

  if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
    return null;
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, contractAbi, wallet);
}

async function waitForImageId(tx) {
  const receipt = await tx.wait();
  const event = receipt.logs
    .map((log) => {
      try {
        return getContract().interface.parseLog(log);
      } catch (_error) {
        return null;
      }
    })
    .find((log) => log && log.name === "ImageRegistered");

  return event ? event.args.imageId.toString() : null;
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "medchain-backend",
    chainEnabled: Boolean(getContract())
  });
});

app.post("/api/images", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "image file is required" });
    }

    const metadata = {
      patientAddress: req.body.patientAddress,
      modality: req.body.modality,
      bodyPart: req.body.bodyPart,
      studyDate: req.body.studyDate,
      note: req.body.note
    };
    const imageHash = sha256File(req.file.path);
    const metadataHash = sha256Json(metadata);
    const storageUri = `${req.protocol}://${req.get("host")}/files/${req.file.filename}`;

    const contract = getContract();
    if (!contract) {
      return res.status(202).json({
        mode: "off-chain-only",
        imageHash,
        metadataHash,
        storageUri,
        metadata
      });
    }

    const tx = await contract.registerImage(imageHash, storageUri, metadataHash);
    const imageId = await waitForImageId(tx);

    res.status(201).json({
      imageId,
      txHash: tx.hash,
      imageHash,
      metadataHash,
      storageUri,
      metadata
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/images/:imageId/grants", async (req, res, next) => {
  try {
    const contract = getContract();
    if (!contract) {
      return res.status(503).json({ error: "blockchain connection is not configured" });
    }

    const tx = await contract.grantAccess(req.params.imageId, req.body.grantee);
    await tx.wait();

    res.json({ txHash: tx.hash, imageId: req.params.imageId, grantee: req.body.grantee });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/images/:imageId/grants/:grantee", async (req, res, next) => {
  try {
    const contract = getContract();
    if (!contract) {
      return res.status(503).json({ error: "blockchain connection is not configured" });
    }

    const tx = await contract.revokeAccess(req.params.imageId, req.params.grantee);
    await tx.wait();

    res.json({ txHash: tx.hash, imageId: req.params.imageId, grantee: req.params.grantee });
  } catch (error) {
    next(error);
  }
});

app.get("/api/images/:imageId/access/:requester", async (req, res, next) => {
  try {
    const contract = getContract();
    if (!contract) {
      return res.status(503).json({ error: "blockchain connection is not configured" });
    }

    const allowed = await contract.canAccess(req.params.imageId, req.params.requester);
    res.json({ imageId: req.params.imageId, requester: req.params.requester, allowed });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: error.message || "internal server error" });
});

app.listen(port, () => {
  console.log(`MedChain backend listening on http://127.0.0.1:${port}`);
});
