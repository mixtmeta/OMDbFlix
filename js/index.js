var SearchViewModel = function() {
	var self = this;
	self.title = ko.observable();
	
	self.doSearch = function() {
		$.ajax({
			type: 'GET',
			url: 'http://www.omdbapi.com/?s=' + encodeURIComponent(self.title()),
			dataType: 'json',
			success: function(data, textStatus, jqXHR) {
				ko.mapping.fromJS(data.Search, mappingOptions, resultsViewModel.Search);
				$('#results').show();
			},
			error: function(jqXHR, textStatus, errorThrown) {
				alert('Don\'t panic, but something went wrong.\r\n' + errorThrown);
			}
		});
	};
};

var ModalViewModel = function(data) {
	var self = this;
	ko.mapping.fromJS(data, {}, self);
	
	self.posterUrl = ko.computed(function() {
		if(self.Poster && self.Poster() !== 'N/A') {
			return self.Poster();
		}
		else {
			return 'http://placehold.it/166x236&text=No+Image';
		}
	});
}

var ResultViewModel = function(data) {
	var self = this;
	ko.mapping.fromJS(data, {}, self);
	self.posterUrl = ko.observable();
	
	ko.computed(function() {
		$.ajax({
			type: 'GET',
			url: 'http://www.omdbapi.com/?i=' + self.imdbID(),
			dataType: 'json',
			success: function(data, textStatus, jqXHR) {
				if(data.Poster && data.Poster !== 'N/A') {
					self.posterUrl(data.Poster);
				}
				else {
					self.posterUrl('http://placehold.it/166x236&text=No+Image');
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				alert('Don\'t panic, but something went wrong.\r\n' + errorThrown);
			}
		});
	});
	
	self.loadModal = function() {
		$.ajax({
			type: 'GET',
			url: 'http://www.omdbapi.com/?i=' + self.imdbID(),
			dataType: 'json',
			success: function(data, textStatus, jqXHR) {
				if(!ko.dataFor($('#modalDetails')[0])) {
					modalViewModel = new ModalViewModel(data);
					ko.applyBindings(modalViewModel, $('#modalDetails')[0]);
				}
				ko.mapping.fromJS(data, modalViewModel);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				alert('Don\'t panic, but something went wrong.\r\n' + errorThrown);
			}
		});
	}
};

var ResultsViewModel = function(data) {
	var self = this;
	ko.mapping.fromJS(data, {}, self);
	ko.mapping.fromJS(data.Search, mappingOptions, self.Search);
	
	self.SearchResult = ko.computed(function() {
		var result = [];
		if(typeof self.Search() !== 'undefined') { 
			for(var i = 0; i < self.Search().length; i += 5) {
				var row = [];
				for(var j = 0; j < 5; j++) {
					if(self.Search()[i + j]) {
						row.push(self.Search()[i + j]);
					}
				}
				result.push(row);
			}
		}
		return result;
	});
};

var mappingOptions = {
	create: function(options) {
		return new ResultViewModel(options.data);
	}
};

var modalViewModel;
var searchViewModel = new SearchViewModel();
var resultsViewModel = new ResultsViewModel({'Search': []});
ko.applyBindings(searchViewModel, $('#searchForm')[0]);
ko.applyBindings(resultsViewModel,  $('#results')[0]);