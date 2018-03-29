from . import *  
from app.home.models.helpers import *
from app.home.models.helpers import NumpyEncoder as NumpyEncoder

project_name = "WhosAGoodDog"
net_id = "Declan Sander: dms497, James Stoyell: jms852, Troy Joseph: tcj29, Matan Presberg: mgp64, Alyssa Trigg: avt26"


@home.route('/', methods=['GET'])
def home_route():
    return render_template('index.html')
