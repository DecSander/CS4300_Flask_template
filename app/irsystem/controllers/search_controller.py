from . import *  
from app.irsystem.models.helpers import *
from app.irsystem.models.helpers import NumpyEncoder as NumpyEncoder

project_name = "WhosAGoodDog"
net_id = "Declan Sander: dms497, James Stoyell: jms852, Troy Joseph: tcj29, Matan Presberg: mgp64, Alyssa Trigg: avt26"

@irsystem.route('/', methods=['GET'])
def search():
	query = request.args.get('search')
	if not query:
		data = []
		output_message = ''
	else:
		output_message = "Your search: " + query
		data = range(5)
	return render_template('search.html', name=project_name, netid=net_id, output_message=output_message, data=data)



