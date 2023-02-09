
<?php

$post = file_get_contents('php://input');

$data = json_decode($post, true);

// получаем обьект , перенеправляем в функцию: queryPost, queryGet

include_once("URLs.php");
include_once("modelJSAPI.php");
include_once("controllerAPI.php");

$v=new controllerAPI;
if(!empty(@$data['menuJS'])){
    $menu=@$data['menuJS'];
    switch ($menu) {
        case 'get':
            $v3=$v->queryGet($data);
            break;
        // case 'post':
        //     $v3=$v->save($data);
        //     break; 
        default:
            $v3=$v->queryPost($data);
            break;
    }
}
$v3 = json_encode($v3, true);
print_r(@$v3);

?>
