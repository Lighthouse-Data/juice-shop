module.exports = function searchProducts () {
  return (req: Request, res: Response, next: NextFunction) => {
    let criteria: any = req.query.q === 'undefined' ? '' : req.query.q ?? ''
    criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200)
    criteria = criteria.replace(/"|'|;|and|or/i, "")
    models.sequelize.query(`SELECT * FROM Products WHERE ((name LIKE :search OR description LIKE :search) AND deletedAt IS NULL) ORDER BY name`, 
    { replacements: { search: `%${criteria}%` }, type: models.sequelize.QueryTypes.SELECT })
      .then(([products]: any) => {
        const dataString = JSON.stringify(products)
        for (let i = 0; i < products.length; i++) {
          products[i].name = req.__(products[i].name)
          products[i].description = req.__(products[i].description)
        }
        res.json(utils.queryResultToJson(products))
      }).catch((error: ErrorWithParent) => {
        next(error.parent)
      })
  }
}