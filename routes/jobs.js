"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureLoggedIn, isAdmin, correctUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Job = require("../models/jobs");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch");
const { emit } = require("../app");
const router = express.Router();

router.post("/", isAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (e) {
    return next(e);
  }
});

router.get("/", async function (req, res, next) {
  try {
    let request = req.query;
    if (request.minSalary !== undefined) request.minSalary = +request.minSalary;
    if (request.hasEquity) request.hasEquity = "true";
    const validator = jsonschema.validate(request, jobSearchSchema);
    if (!validator.valid) {
      errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const results = await Job.findAll(request);
    return res.json({ results });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Job.get(id);
    return res.json({ result });
  } catch (e) {
    return next(e);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const update = await Job.update(req.params.id, req.body);
    return res.json({ update });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", isAdmin, async (req, res, next) => {
  try {
    const action = await Job.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
