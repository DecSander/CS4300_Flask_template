from flask import Blueprint

# Define a Blueprint for this module (mchat)
irsystem = Blueprint('irsystem', __name__, url_prefix='/api',static_folder='static',template_folder='templates')

# Import all controllers
from controllers.api_controller import *
