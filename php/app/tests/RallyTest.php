<?php

class RallyTest extends TestCase
{

    private $loginUser = "";
    private $loginPassword = "";

    /**
     * A basic functional test example.
     *
     * @return void
     */
    public function testCRUD()
    {
        //login
        $rally = new Rally($this->loginUser, $this->loginPassword);

        $projname ="Wlab";// "Spark >";
        //get project
        $proj_list = $rally->find('Project', "(Name = \"$projname\")", '', "true");
        $this->assertTrue(count($proj_list)==1);
        $testingProject=$proj_list[0];
        
        //get release
        $release_list = $rally->find('Release', "(Project.Name = \"{$projname}\")");
        $this->assertTrue(count($release_list)>0);


        //find all userstories
        $userstories_all = $rally->find('userstory', "(Project.Name = \"{$projname}\")");
        $this->assertTrue(count($userstories_all)>0);
        
        //create a user storay
        $userStoryName = "[DELETE]QA:Testing";
        $root = $rally->create('userstory', array(
            'Name' => $userStoryName,
            'Project' => $testingProject['_ref'],
            'Description' => "PLEASE DELETE!",
            "Owner" => $rally->me(),
        ));
        
        $newUSArray = $rally->find('userstory', "(Name = \"{$userStoryName}\")");
        $this->assertTrue(count($newUSArray)>0); //create successfully
        $newUS=$newUSArray[0];
        
        
        //update a user story
        $updatedField=array();
        $newDescription="Test Update";
        $updatedField['Description']=$newDescription;
        $rally->update('userstory',$newUS['_refObjectUUID'],$updatedField);
        $updateUsArray=$rally->find('userstory', "(Name = \"{$userStoryName}\")","","true");
        $updateUs=$updateUsArray[0];
        $this->assertTrue($updateUs['Description']==$newDescription);
        
        //delete user story
        foreach ($newUSArray as $us) {
            $rally->delete("userstory", $us['_refObjectUUID']);
        }
        $newUSArray = $rally->find('userstory', "(Name = \"{$userStoryName}\")","","true");
        $this->assertTrue(count($newUSArray)==0);
    }

}
