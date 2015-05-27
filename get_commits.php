<?php

if (!file_exists('users.json')) {
  throw new Exception('users.json not found. Please run get_users.php.');
}

// Decode json file
$json = file_get_contents('users.json');
if (!$users = json_decode($json, TRUE)) {
  throw new Exception('Unable to decode users.json. Plase re-run get_users.php.');
}

// Clone the Drupal repository and assemble commit information
$output = shell_exec('rm -rf repos/drupal && git clone --branch 8.0.x http://git.drupal.org/project/drupal.git repos/drupal');
$log = shell_exec('git --git-dir repos/drupal/.git log --no-merges --format=\'"%h","%at","%an","%ae","%s"\'');
$csv_rows = explode("\n", $log);

// Git log is displayed newest to oldest, but we usually want to display that data chronologically
$csv_rows = array_reverse($csv_rows);

$acquia_commits = array();
foreach ($csv_rows as $csv_row) {
  $commit = str_getcsv($csv_row);
  // Process commit attribution from subject
  if (!empty($commit[4])) {
    // Regex shamefully stolen from https://github.com/lauriii/drupalcores/blob/master/app/bin/json.rb
    $matches = array();
    preg_match_all('/\s(?:by\s?)([[:word:]\s,.|]+):/i', $commit[4], $matches);
    $matches = end($matches);
    if (count($matches) > 0) {
      $contributors = preg_split('/(?:,|\||\band\b|\bet al(?:.)?)/', $matches[0]);
      $contributors = array_map('trim', $contributors);
    }
  }
  $contributors = isset($contributors) ? $contributors : array();
  // Check to see if an Acquia employee was involved with this commit
  $commit_contributors = array();
  foreach ($users as $user) {
    $full_name = $user['first_name'] . ' ' . $user['last_name'];
    // Check if this is a contribution
    if (in_array($user['name'], $contributors) || in_array($full_name, $contributors)) {
      $commit_contributors[] = $user;
    }
    // An employee might also be the commit author, in the case of commits not related to issues (think early Drupal)
    elseif ((isset($commit[2]) && $full_name == $commit[2]) || (isset($commit[3]) && $user['mail'] == $commit[3])) {
      $commit_contributors[] = $user;
    }
  }
  // If we set an author or contributor, add this commit to our dataset
  if (!empty($commit_contributors)) {
    $acquia_commits[] = array(
        'contributors' => $commit_contributors,
        'timestamp' => $commit[1]
    );
  }
}

$json = json_encode($acquia_commits);
file_put_contents('commits.json', $json);
