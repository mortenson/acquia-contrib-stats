<?php

require_once('simple_html_dom.php');

/* Get UIDs for each Acquia employee */

$html = file_get_html('https://www.drupal.org/marketplace/acquia');
$uids = array();
foreach ($html->find('.aside h3 > a') as $item) {
  $uids[] = $item->{'data-uid'};
}

/* Pull user information from the API endpoint */

$max = 1000;
$i = 0;
$users = array();
foreach ($uids as $uid) {
  echo "Processing $i out of " . count($uids) . "\n";
  if ($i >= $max) {
    break;
  }
  $data = file_get_contents('https://www.drupal.org/api-d7/user.json?uid=' . $uid);
  if ($data && $json = json_decode($data, TRUE)) {
    $user = $json['list'][0];
    $users[$uid] = array(
      'country' => $user['field_country'],
      'first_name' => $user['field_first_name'],
      'last_name' => $user['field_last_name'],
      'name' => $user['name'],
      'uid' => $uid,
      'mail' => $user['name'] . '@' . $uid . '.no-reply.drupal.org'
    );
  }
  ++$i;
}

$json = json_encode($users);
file_put_contents('users.json', $json);