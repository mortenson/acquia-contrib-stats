$(function() {
    $.getJSON("commits.json", function(data) {
        var commits_monthly = {};
        // Count the number of commits per month
        for (var i in data) {
            commits_monthly[i] = {};
            for (var j in data[i]) {
                // Get date object and key for the current month
                var date = new Date(data[i][j].timestamp * 1000);
                var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                var key = firstDay.getFullYear() + '_' + firstDay.getMonth();

                // Add a new data point if one does not already exist
                if (commits_monthly[i][key] === undefined) {
                    commits_monthly[i][key] = {
                        'count': 1,
                        'date': firstDay
                    };
                }
                // Increment existing data point
                else {
                    ++commits_monthly[i][key].count;
                }
            }
        }
        // MetricGraphics.js requires a flat array of objects
        var acquia_commits = flatten_object(commits_monthly['acquia']);
        var all_commits = flatten_object(commits_monthly['all']);
        // Mark the Drupal releases to get some context for spikes
        var markers = [
            {
                'date': new Date('2007-1-15'),
                'label': 'Drupal 5 released'
            },
            {
                'date': new Date('2008-2-13'),
                'label': 'Drupal 6 released'
            },
            {
                'date': new Date('2011-1-5'),
                'label': 'Drupal 7 released'
            },
            {
                'date': new Date('2013-05-20'),
                'label': 'Drupal 8 alpha released'
            },
            {
                'date': new Date('2014-10-01'),
                'label': 'Drupal 8 beta released'
            }
        ];

        // Create the graph
        MG.data_graphic({
            title: 'Drupal Core Contributions per Month',
            data: [acquia_commits, all_commits],
            legend: ['Employee Contributions', 'All Community Contributions'],
            legend_target: '#legend',
            full_width: true,
            right: 150,
            x_rug: true,
            height: 600,
            target: '#chart',
            x_accessor: 'date',
            y_accessor: 'count',
            markers: markers,
            animate_on_load: true,
            mouseover: function(d, i) {
                var chart = d3.select('#chart svg .mg-active-datapoint');
                var text = chart.text();
                // Replace the text lazily instead of reprocessing the output
                text = text.replace('1, ', '') + ' commits';
                chart.text(text);
            }
        });

        // Create list of employee contributors this last month (30 days)
        var contributors = {};
        var last_month = (Date.now()/1000) - 2592000;
        var total = 0;
        var list = $('#top ol');
        for (var i in data['acquia']) {
            if (last_month <= data['acquia'][i].timestamp) {
                for (var j in data['acquia'][i].contributors) {
                    var contributor = data['acquia'][i].contributors[j];
                    if (contributors[contributor.name] === undefined) {
                        contributors[contributor.name] = true;
                        list.append('<li>' + contributor.name + '</li>');
                    }
                }
                ++total;
            }
        }
        list.append('<li>Total: ' + total + ' commits</li>');
    });
});

// Utility function to flatten an object into values
function flatten_object(object, create_tuple) {
    var flat = [];
    for (var i in object) {
        if (create_tuple) {
            flat.push([i, object[i]]);
        }
        else {
            flat.push(object[i]);
        }
    }
    return flat;
}
