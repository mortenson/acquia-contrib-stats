# acquia-contrib-stats
Pull and display statistics on Acquia employee contributions to Drupal

# Instructions
1. Clone repository into your webroot
1. `cd` to the repository directory
1. Run `php get_users.php`, progress should be displayed on-screen
1. Run `php get_commits.php`
1. Visit index.html in your web browser of choice
1. Enjoy

# Notes
I started this project before finding https://github.com/lauriii/drupalcores, and ended up using their regular expressions instead of mine as they were more accurate (this is accredited inline). Ideally the functionality shown here would be rolled back into DrupalCores eventually so users could compare different company contributions over time.
