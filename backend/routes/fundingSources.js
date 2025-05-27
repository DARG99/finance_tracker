const express = require("express");
const router = express.Router();
const {
  getFundingSources,
  createFundingSource,
  deleteFundingSource,
} = require("../controllers/fundingSourcesController");
const authenticateUser = require("../middleware/auth");

router.get("/", authenticateUser, getFundingSources);
router.post("/", authenticateUser, createFundingSource);
router.delete("/:id", authenticateUser, deleteFundingSource);

module.exports = router;
