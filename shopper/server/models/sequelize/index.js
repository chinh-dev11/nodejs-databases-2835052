const {DataTypes}=require('sequelize')

module.exports = (sequelize) =>{
    const Order = sequelize.define('Order',{
        userId: DataTypes.STRING(24),
        email: DataTypes.STRING,
        status: DataTypes.STRING
    })

    const OrderItem = sequelize.define('OrderItem',{
        sku: DataTypes.INTEGER,
        qty: DataTypes.INTEGER,
        name: DataTypes.INTEGER,
        price: DataTypes.DECIMAL(10,2),
    })

    Order.hasMany(OrderItem) // relationship
    OrderItem.belongsTo(Order, {
        onDelete: 'CASCADE', // define deletion trigger: all order items belongs to an order. If an order is deleted, all items that belong to an order are deleted as well.
        foreignKey: {
            allowNull: false // this means that each order item really has to have a relation to the order table.
        } 
    })

    /* 
        This may look very familiar to Mongoose models but there is a huge difference;
        - In Mongoose, only indexes are created on the database, but it does not create a database schema. It just uses the model information that you have, to delete the stored data, or give you the object to operate on.
        - With Sequelize and MySQL, this information this structure is now written to the database.
    */
    sequelize.sync() // instructs sequelize to sync them all that we defined here into the database.
}
