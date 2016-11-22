from flask import Flask, flash, redirect, render_template, request, session, url_for, send_from_directory, jsonify
import pg, os, random, string, bcrypt, uuid

db = pg.DB(dbname="E_commerce")


app = Flask("ecommerce", static_url_path='')

@app.route('/')
def home():
    return app.send_static_file('index.html')

@app.route('/api/products', methods=["GET"])
def get_products():
    product_list = db.query('select * from product').dictresult()
    return jsonify(product_list)

@app.route('/api/product-details/<id>', methods=["GET"])
def get_productID(id):
    product = db.query('select * from product where id = $1', id).dictresult()
    result = product[0]
    return jsonify(result)

@app.route('/api/user/signup', methods=["POST", "GET"])
def signup():
    data = request.get_json()
    password = data['password']
    salt = bcrypt.gensalt()
    encrypted_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    db.insert (
        "customer",
        username = data['username'],
        email = data['email'],
        password = encrypted_password,
        first_name = data['first_name'],
        last_name = data['last_name']
    )
    return "poop"

@app.route('/api/user/login', methods=["POST", "GET"])
def login():
    print request
    credentials = request.get_json()
    print "credentials:", credentials
    password = credentials['password']
    print credentials
    results = db.query('select * from customer where username = $1', credentials['username']).namedresult()
    user = results[0]
    print user.password
    rehash = bcrypt.hashpw(password.encode('utf-8'), user.password)
    if rehash == user.password:
        print 'Login Success!'
        token = uuid.uuid4()
        db.insert (
            "auth_token",
            token = token,
            customer_id = user.id
        )
        return jsonify({
            'auth_token': token,
            'user': {
                'first_name': user.first_name,
                'id': user.id,
                'email': user.email
            }
        })
    else:
        return 'Login Failed', 401

@app.route('/api/add_shopping_cart', methods=["POST"])
def add_to_cart():
    data = request.get_json()
    get_token = data.get('auth_token')
    # post_token = request.get_json().get('auth_token')
    product = data.get('product')
    customer_id = db.query('''
    select
        customer.id
    from
        customer, auth_token
    where
        customer.id = auth_token.customer_id and
        auth_token.token = $1
    ''', get_token).namedresult()
    print 'this is a product', product
    print "customer id: ", customer_id
    db.insert (
        "product_in_shopping_cart",
        product_id = product,
        customer_id = customer_id[0].id
    )
    product_query = db.query('''
    select
        product.id, product.name
    from
        product, product_in_shopping_cart, customer
    where
        product.id = product_in_shopping_cart.product_id and
        product_in_shopping_cart.customer_id = customer.id and
        customer.id = $1
    ''', customer_id[0].id).dictresult()
    print product_query
    return jsonify(product_query)

@app.route('/api/show_shopping_cart', methods=["GET"])
def show_cart():
  token = request.args.get('auth_token')
  customer_id = db.query('''
  select
      customer.id
  from
      customer, auth_token
  where
      customer.id = auth_token.customer_id and
      auth_token.token = $1
  ''', token).namedresult()
  cart_query = db.query('''
  select
      product.id, product.name, product.price, product.description, product.image_path
  from
      product, product_in_shopping_cart, customer
  where
      product.id = product_in_shopping_cart.product_id and
      product_in_shopping_cart.customer_id = customer.id and
      customer.id = $1
  ''', customer_id[0].id).dictresult()
  return jsonify(cart_query)







if __name__ == "__main__":
    app.run(debug=True)
