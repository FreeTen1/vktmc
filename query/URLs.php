<?php

class URLs //extends AnotherClass
{
  static $u="http://127.0.0.1:5001";
  static $url_permisAuth="http://10.238.3.229:5007/permisAuth"; 
  static $url_main="http://127.0.0.1:5090/offerToDirector";

  public function URLsV($value=''){
    $v='';
    switch ($value) {
      case 'permisAuth':
        $v=$this::$url_permisAuth;
      break;
      case 'post':
        $v=$this::$url_main;
        break;
      default:
        $v=$this::$url_main;
        break;
  }
  return $v;
  }
}

?>