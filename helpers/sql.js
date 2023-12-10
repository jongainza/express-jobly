const { BadRequestError } = require("../expressError");

/* This function helps the calling function to SET an SQL UPDATE

@param dataToUpdate is an {object} witht the new data to update

@param jsToSql is an {object} where the keys of dataToUpdate have the values of the table colums names

*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // here we are getting an [array]of "strings"
  // each string all ready has the correct column name and equals it to a variable
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  // our response is an {object} with keys setCols and values, where the values are all the strings from the cols variable joined
  // and the values of the key "values", are directly the values of the objet{dataToUpdate}
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
