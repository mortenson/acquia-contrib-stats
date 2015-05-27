$(function() {
    $.getJSON("commits.json", function(data) {
        var commits_monthly = {};
        // Count the number of commits per month
        for (var i in data) {
            // Get date object and key for the current month
            var date = new Date(data[i].timestamp*1000);
            var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            var key = firstDay.getFullYear() + '_' + firstDay.getMonth();

            // Add a new data point if one does not already exist
            if (commits_monthly[key] === undefined) {
                commits_monthly[key] = {
                    'count': 1,
                    'date': firstDay
                };
            }
            // Increment existing data point
            else {
                ++commits_monthly[key].count;
            }
        }
        // MetricGraphics.js requires a flat array of objects
        var commits_monthly_flat = flatten_object(commits_monthly);
        // Mark the Drupal releases to get some context for spikes
        var markers = [
            {
                'date': new Date('2002-6-25'),
                'label': 'Drupal 4 released'
            },
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
            }
        ];
        // Create the graph
        MG.data_graphic({
            title: 'Acquia Contributions to Drupal Core',
            data: commits_monthly_flat,
            full_width: true,
            height: 600,
            target: '#chart',
            x_accessor: 'date',
            y_accessor: 'count',
            markers: markers,
            mouseover: function(d, i) {
                var chart = d3.select('#chart svg .mg-active-datapoint');
                var text = chart.text();
                // Replace the text lazily instead of reprocessing the output
                text = text.replace('1, ', '') + ' commits';
                chart.text(text);
            }
        });

        // Create list of top contributors this last month (30 days)
        var totals_month = {};
        var last_month = (Date.now()/1000) - 2592000;
        var total = 0;
        for (var i in data) {
            if (last_month <= data[i].timestamp) {
                for (var j in data[i].contributors) {
                    var contributor = data[i].contributors[j];
                    if (totals_month[contributor.name] === undefined) {
                        totals_month[contributor.name] = 1;
                        ++total;
                    }
                    else {
                        ++totals_month[contributor.name];
                        ++total;
                    }
                }
            }
        }
        // Sort totals
        var totals_month_sorted = flatten_object(totals_month, true);
        // Sort array
        totals_month_sorted.sort(function(a, b) {
            a = a[1];
            b = b[1];

            return a > b ? -1 : (a < b ? 1 : 0);
        });
        // Display in list
        for (var i in totals_month_sorted) {
            if (i >= 10) {
                break;
            }
            var user = totals_month_sorted[i][0];
            var count = totals_month_sorted[i][1];
            $('#top ol').append('<li>' + user + ' (' + count + ')</li>');
        }
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
