const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  static async create({ title, salary, equity, company_handle }) {
    const duplicate = await db.query(`SELECT title FROM jobs WHERE title=$1`, [
      title,
    ]);
    if (duplicate.rows[0])
      throw new BadRequestError(
        `Job with title ${title} all ready exists on the data base`
      );
    let results = await db.query(
      `INSERT  INTO jobs (title,salary,equity,company_handle ) VALUES ($1,$2,$3,$4) RETURNING title,salary,equity,company_handle AS companyHandle`,
      [title, salary, equity, company_handle]
    );
    let job = results.rows[0];
    return job;
  }

  static async findAll({ minSalary, hasEquity, title } = {}) {
    let query = ` SELECT id, title, salary, equity, company_handle AS companyHandle
                FROM jobs`;

    let whereExpressions = [];
    let whereValues = [];

    if (minSalary) {
      whereValues.push(request.minSalary);
      whereExpressions.push(`salary>=$${whereValues.length}`);
    }
    if (hasEquity) {
      whereValues.push(request.hasEquity);
      whereExpressions.push(`equity=$${whereValues.length}`);
    }
    if (title !== undefined) {
      whereValues.push(`%${title}%`);
      whereExpressions.push(`title ILIKE $${whereValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += ` WHERE ` + whereExpressions.join(" AND ");
    }

    let results = await db.query(query, whereValues);
    return results.rows;
  }
  static async get(id) {
    let search = await db.query(
      `SELECT id, title, salary,equity,company_handle as "companyHandle" 
                                FROM jobs 
                                WHERE id=$1`,
      [id]
    );
    let job = search.rows[0];
    if (!job) throw new NotFoundError(`No job with id:${id}`);

    let company = await db.query(
      `SELECT handle,name,description,num_employees AS "numEmployees", logo_url AS "logoUrl"
                                    FROM companies
                                    WHERE handle=$1`,
      [job.companyHandle]
    );
    delete job.companyHandle;
    job.company = company.rows[0];

    return job;
  }

  static async update(id, data) {
    let { setCols, values } = sqlForPartialUpdate(data, {});
    let idVar = "$" + (values.length + 1);
    let query = `UPDATE jobs
                SET ${setCols}
                WHERE id = ${idVar}
                RETURNING id,title,salary,equity,company_handle AS "companyHandle"`;
    let result = await db.query(query, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`no job:${id}`);

    return job;
  }

  static async remove(id) {
    let result = await db.query(`DELETE FROM jobs WHERE id=$1 RETURNING id`, [
      id,
    ]);
    let job = result.rows[0];
    if (!job) throw new NotFoundError(`no job:${id}`);
  }
}
module.exports = Job;
