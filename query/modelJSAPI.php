<?php

class modelJSPHP extends URLs{
  static  $url='';
  static  $options='';

  
  //преобразуем переменные в строку url
  private function API_query($a,$url){
    $aCount=count(@$a);
    if($aCount>0){
      $options=http_build_query($a);
      $options=$url.'?'.$options;}
    else{$options=$url;}
    return $options;
  }

  //запрос на чтение GET
  public function readAPI($a,$url){
    $options=$this->API_query($a,$url);
    $curl = curl_init();

    curl_setopt_array($curl, array(
      CURLOPT_URL => $options,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => "",
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 0,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => "GET",
      CURLOPT_POSTFIELDS =>"\r\n\r\n",
      ));

    $response = curl_exec($curl);
    curl_close($curl);
    return $response;
  }


  //запрос на передачу данных POST
  protected function editAPI($a,$url){
      $a=json_encode($a,JSON_UNESCAPED_UNICODE);
    // echo $a;
    $options=$a;
    $curl = curl_init();

    curl_setopt_array($curl, array(
      CURLOPT_URL => "$url",
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => "",
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 0,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => "POST",
      CURLOPT_POSTFIELDS =>"$options",
      CURLOPT_HTTPHEADER => array(
        "Content-Type: application/json"
      ),
    ));
    $response = curl_exec($curl);
    
    curl_close($curl);
      return $response;
  }












  


  //  //запрос на чтение GET+json
  //   protected function readAPIjson($a,$url){
  //       $options=$this->API_query($a,$url);
  //       $curl = curl_init();

  //       curl_setopt_array($curl, array(
  //         CURLOPT_URL => $options,
  //         CURLOPT_RETURNTRANSFER => true,
  //         CURLOPT_ENCODING => "",
  //         CURLOPT_MAXREDIRS => 10,
  //         CURLOPT_TIMEOUT => 0,
  //         CURLOPT_FOLLOWLOCATION => true,
  //         CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  //         CURLOPT_CUSTOMREQUEST => "GET",
  //         CURLOPT_POSTFIELDS =>"\r\n\r\n",
  //         CURLOPT_HTTPHEADER => array(
  //           "Content-Type: application/json"
  //         ),
  //       ));
        
  //       $response = curl_exec($curl);
  //       curl_close($curl);
  //       return $response;
  // }
  //  //запрос на передачу данных POST+json
  //  protected function editAPIstring($a,$url){
  //   $a=json_encode($a,JSON_UNESCAPED_UNICODE);
  //   $options=$a;
  //   $curl = curl_init();

  //   curl_setopt_array($curl, array(
  //     CURLOPT_URL => "$url",
  //     CURLOPT_RETURNTRANSFER => true,
  //     CURLOPT_ENCODING => '',
  //     CURLOPT_MAXREDIRS => 10,
  //     CURLOPT_TIMEOUT => 0,
  //     CURLOPT_FOLLOWLOCATION => true,
  //     CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  //     CURLOPT_CUSTOMREQUEST => 'POST',
  //     CURLOPT_POSTFIELDS =>"$options",
  //     CURLOPT_HTTPHEADER => array(
  //       'Content-Type: application/json'
  //     ),
  //   ));

  //   $response = curl_exec($curl);

  //   curl_close($curl);
  //   // echo $response;

  //   return $response;
  // }

    
}

?>
