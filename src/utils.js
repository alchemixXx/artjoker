
function getAllUsers(data) {
  const results = [];
  data.forEach((item) => {
    const { UserName, FirstName, LastName, Age } = item;
    const user = {
      UserName,
      FirstName,
      LastName,
      Age,
    };
    results.push(user);
  });

  return results;
}

module.exports = { getAllUsers };
