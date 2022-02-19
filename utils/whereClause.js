//base-Product.find()
//bigQ-//search=code&page=2&category=shorts&rating[gte]=4&price[lte]=999&price[gte]=199&limit=5

class WhereClause {
  constructor(base, bigQ) {
    this.base = base;
    this.bigQ = bigQ;
  }

  search() {
    const searchKeyword = this.bigQ.search
      ? {
          name: {
            $regex: this.bigQ.search,
            $options: "i", //it is for case insensitivity
          },
        }
      : {};

    this.base = this.base.find({ ...searchKeyword });
    return this;
  }

  filter() {
    const copyQ = { ...this.bigQ };

    delete copyQ["search"];
    delete copyQ["page"];
    delete copyQ["limit"];

    //convert bigQ into string=>copyQ
    let stringOfCopyQ = JSON.stringify(copyQ);
    stringOfCopyQ = stringOfCopyQ.replace(
      /\b(gte|lte|gt|lt)\b/g,
      (m) => `$${m}`
    );

    const jsonOfCopyQ = JSON.parse(stringOfCopyQ);
    this.base = this.base.find(jsonOfCopyQ);
    return this;
  }

  pager(resultPerPage) {
    let currentPage = 1;
    if (this.bigQ.page) {
      currentPage = this.bigQ.page;
    }
    const skipval = resultPerPage * (currentPage - 1);
    this.base = this.base.limit(resultPerPage).skip(skipval);
    return this;
  }
}

module.exports = WhereClause;
