jQuery.fn.extend({
    autocompleteSearch: function (options) {
        var form = this.closest('form');
        var elem = this;
        this.autocomplete({
            serviceUrl: form.data('autocompleteurl'),
            params: {
                queryString: elem.val(),
                parent: form.data('parent')
            },
            noCache: true,
            formatResult: function (suggestion, currentValue) {
                var pattern = '(' + $.Autocomplete.utils.escapeRegExChars(currentValue) + ')';

                return suggestion.value
                    .replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>')
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/&lt;(\/?strong)&gt;/g, '<$1>');
            },
            dataType: 'json',
            onSelect: function (suggestion) {
                if (options.submitOnSelect) {
                    elem.val(suggestion.value);
                    form.find('.trigger').val('Autocomplete');
                    form.submit();
                }
            },
            minChars: 3
        });
    }
});

if (typeof Filters === 'undefined') {
    var Filters = {};
}

Filters.Vars = {
  state: null,
  title: null,
  baseUrl: null,
  replace: false
};

Filters.DOM = {
  $form: null,
  $selects: null,
  $page: null,
  $listing: null,
  $pagination: null,
  $reset: null,
  $filter: null,
  $keyword: null
};

Filters.init = function () {
  Filters.DOM.$form = $('#filters-form');
  if(Filters.DOM.$form.length) {
    Filters.Vars.state = {};
    Filters.DOM.$selects = Filters.DOM.$form.find('select');
    Filters.DOM.$page = Filters.DOM.$form.find('input[name="page"]');
    Filters.DOM.$listing = $('.listing-results');
    Filters.DOM.$pagination = $('.pagination-container');
    Filters.DOM.$reset = $('.reset-button');
    Filters.DOM.$reset.on('click', Filters.Events.ResetClick);
    Filters.DOM.$keyword = Filters.DOM.$form.find('input[name="keyword"]');
    Filters.DOM.$keyword.autocompleteSearch({ submitOnSelect: true });
    Filters.DOM.$form.on('submit', Filters.Events.FilterClick);
    Filters.DOM.$filter = $('.filter-button');
    Filters.DOM.$filter.on('click', Filters.Events.FilterClick);
    Filters.DOM.$selects.on('change', Filters.Events.SelectChange);
    Filters.Vars.baseUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
    Filters.Vars.title = document.title;
    
    Filters.DOM.$listing.on('click', '.pagination a', Filters.Events.PaginationClick);
    Filters.Helpers.SetState();

    if(typeof window.history !== 'undefined')
    {
      var qs = Filters.Helpers.Serialize(Filters.Vars.state);
      var newUrl = qs !== '' ? Filters.Vars.baseUrl + '?' + qs : Filters.Vars.baseUrl;
      history.replaceState(Filters.Vars.state, Filters.Vars.title, newUrl);
      window.onpopstate = Filters.Events.OnPop;
    }
  }
};

Filters.Events = {
    SelectChange: function () {
    Filters.DOM.$page.val('1');
    Filters.Helpers.SetState();
    Filters.Helpers.FetchPage();
  },
  FilterClick: function (e) {
      e.preventDefault();
      Filters.DOM.$page.val('1');
      Filters.Helpers.SetState();
      Filters.Helpers.FetchPage();
  },
  PaginationClick: function(e) {
    e.preventDefault();
    Filters.DOM.$page.val($(this).attr('data-page-num'));
    Filters.Helpers.SetState();
    Filters.Helpers.FetchPage();
  },

  ResetClick: function(e) {
    e.preventDefault();
    Filters.Helpers.ResetState();
    Filters.Helpers.FetchPage();
  },

  OnPop: function(e) {
    Filters.Vars.replace = true;
    Filters.Helpers.ReplaceState(e.state);
    Filters.Helpers.FetchPage();
  }
};

Filters.Helpers = {
  Serialize: function(obj) {
    var str = [];
    for(var p in obj)
      if (obj.hasOwnProperty(p)) {
        if(encodeURIComponent(obj[p]) !== '' && !(p === 'page' && obj[p] === '1'))
        {
          str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
        }
      }
    return str.join('&');
  },

  ReplaceState: function(state) {
    if(state !== null)
    {
      Filters.Vars.state = state;
    }
    else {
      state = {};
    }
    Filters.Helpers.UpdateFilters(state);
    Filters.Helpers.SetState();
  },

  ResetState: function() {
    Filters.DOM.$selects.val('');
    Filters.DOM.$page.val('1');
    Filters.DOM.$keyword.val('');
    Filters.Helpers.SetState();
  },

  SetState: function() {
    Filters.DOM.$selects.each(function(i){
      var $this = $(this);
      Filters.Vars.state[$this.attr('name')] = $this.val(); 
    });
    Filters.Vars.state.page = Filters.DOM.$page.val();
      if (Filters.DOM.$keyword !== null && Filters.DOM.$keyword.length > 0) {
          Filters.Vars.state.keyword = Filters.DOM.$keyword.val();
      }
  },

  FetchPage: function() {
    
    Filters.DOM.$listing.addClass('loading');
    Filters.DOM.$pagination.addClass('loading');

    $.ajax({
      data: Filters.Vars.state,
      dataType: 'html',
      url: Filters.Vars.baseUrl
    }).done(Filters.Helpers.UpdatePage);
  },

  ScrollToResults: function() {
    var listingTop = Filters.DOM.$listing.offset().top,
        scrollTop = $(document).scrollTop(),
        offsetTop = 170,
        listingOffset = listingTop - offsetTop;

    if(listingOffset < scrollTop) {
      $('html, body').animate({
        scrollTop: listingOffset + 'px'
      }, 500);
    }
  },

  UpdateFilters: function(state)
  {
    for(var i in state)
    {
      if(state.hasOwnProperty(i))
      {
        if(i !== 'page')
        {
          Filters.DOM.$selects.filter('[name="' + i + '"]').val(state[i]);
        }
        else {
          if(state[i] !== '')
          {
            Filters.DOM.$page.val(state[i]);
          }
          else {
            Filters.DOM.$page.val('1');
          }
        }
      }
    }
  },

  UpdatePage: function(data)
  {
    Filters.DOM.$listing.removeClass('loading');
    Filters.DOM.$pagination.removeClass('loading');

    var $data = $(data),
    $results = $data.find('.listing-results'),
    $pagination = $data.find('.pagination-container');

    Filters.Vars.title = $data.filter('title');

    Filters.DOM.$page.val(Filters.Vars.state.page);

    Filters.DOM.$listing.html($results.html());

    if($pagination.length) {
      Filters.DOM.$pagination.html($pagination.html());
    }

    Filters.Helpers.UpdateHistory();
    Filters.Helpers.ScrollToResults();
  },

  UpdateHistory: function() {
    if(typeof history !== 'undefined')
    {
      var qs = Filters.Helpers.Serialize(Filters.Vars.state);
      var newUrl = qs !== '' ? Filters.Vars.baseUrl + '?' + qs : Filters.Vars.baseUrl;

      if(Filters.Vars.replace)
      {
        history.replaceState(Filters.Vars.state, Filters.Vars.title, newUrl);
        Filters.Vars.replace = false;
      }
      else{
        history.pushState(Filters.Vars.state, Filters.Vars.title, newUrl);
      }
    }
  }
};

Filters.init();