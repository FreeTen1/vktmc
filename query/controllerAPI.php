<?php

class controllerAPI extends modelJSPHP
{
    static $filter='';
    static $a='';
    static $res='';

    // получение данных с отправкой параметров в адресе
    public function queryGet($options)
        {
            $url=$this::URLsV($options['menuJS']);
            $this::$filter=$url."?".http_build_query($options);

            $a = $this->readAPI($options, $url);
            $a=json_decode($a);
            $res=array('result'=>$a,'filter'=>$this::$filter,'option'=>$options);
            return $res;
        }
        
    // получение данных с отправкой параметров в боди
    public function queryPost($options)
        {
            $url=$this::URLsV($options['menuJS']);
            $this::$filter=$url."?".http_build_query($options);
            
            $a = $this->editAPI($options, $url);
            $a=json_decode($a);
            $res=array('filter'=>$this::$filter,'result'=>$a,'option'=>$options);
            return $res;
        }
}

?>
