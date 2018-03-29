from . import *  
from app.irsystem.models.helpers import *
from app.irsystem.models.helpers import NumpyEncoder as NumpyEncoder

project_name = "WhosAGoodDog"
net_id = "Declan Sander: dms497, James Stoyell: jms852, Troy Joseph: tcj29, Matan Presberg: mgp64, Alyssa Trigg: avt26"


@irsystem.route('/', methods=['GET'])
def home():
    return render_template('index.html')


@irsystem.route('/preferences', methods=['GET'])
def set_preferences():
    return "pref"

