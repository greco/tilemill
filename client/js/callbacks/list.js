/**
 * Router controller: Frontpage. Lists projects and visualizations.
 */
TileMill.controller.list = function() {
  var queue = new TileMill.queue();

  queue.add(function(next) {
    var self = this;
    TileMill.backend.list('project', function(projects) {
      projects = projects || [];
      projects.sort();
      self.store('projects', projects);
      next();
    });
  });

  queue.add(function(next) {
    var self = this;
    TileMill.backend.list('visualization', function(visualizations) {
      visualizations = visualizations || [];
      visualizations.sort();
      self.store('visualizations', visualizations);
      next();
    });
  });

  queue.add(function() {
    var projects = this.retrieve('projects'),
        visualizations = this.retrieve('visualizations');
    var page = $(TileMill.template('list', {
      projects: TileMill.template('column', {
        name: 'Projects',
        type: 'project',
        data: projects
      }),
      visualizations: TileMill.template('column', {
        name: 'Visualizations',
        type: 'visualization',
        data: visualizations
      })
    }));
    TileMill.show(page);

    // Attach delete link handlers.
    $.each(['project', 'visualization'], function(dummy, type) {
      $('#' + type + ' a.file-delete').click(function() {
        if (confirm('Are you sure you want to delete this project?')) {
          $('body').append(TileMill.template('loading', {}));
          var filename = $(this).attr('href').split('#delete=')[1];
          TileMill.backend.del(filename, function() {
            $.bbq.pushState({ 'action': 'list' });
            $(window).trigger('hashchange');
          });
        }
        return false;
      });
    });

    $('div#header a.info').click(function() {
      var settings = {};
      for (var key in TileMill.settings) {
        if (typeof TileMill.settings[key] === 'string') {
          settings[key] = TileMill.settings[key];
        }
      }
      var popup = $(TileMill.template('popup-info-settings', {
          settings: settings
      }));
      TileMill.popup.show({
          content: popup,
          title: 'Info'
      });
      return false;
    });

    $('form').each(function() {
      $(this).validate({
        errorLabelContainer: '#' + $(this).attr('id') + ' .messages',
        submitHandler: function(form) {
          var type = $(form).attr('id'),
              name = $('input.text', form).val();
          TileMill[type].add(name);
          return false;
        }
      });
    });
  });

  queue.execute();
};