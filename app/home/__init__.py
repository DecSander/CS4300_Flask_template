from flask import Blueprint

# Define a Blueprint for this module (mchat)
home = Blueprint('home', __name__, url_prefix='/', static_folder='static', template_folder='templates')

# Import all controllers
from controllers.home_controller import *
