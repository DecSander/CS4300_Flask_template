from flask import Blueprint
from flask import render_template

# Define a Blueprint for this module (mchat)
home = Blueprint('home', __name__, url_prefix='/', static_folder='static', template_folder='templates')


@home.route('/', methods=['GET'])
def home_route():
    return render_template('index.html')
