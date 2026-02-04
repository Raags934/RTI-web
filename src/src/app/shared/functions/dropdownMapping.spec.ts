import { mapFranchisesToDropdown,mapTAsToDropdown,mapBrandsToDropdown,mapRolesToDropdown,mapFunctionsToDropdown,mapValueListToDropdown,getRtiYearDropdown,getLaunchClaimDropdown,mapResearchPathwayToDropdown, mapProductsToDropdown } from "./dropdownMapping";  
import { Franchise } from "../../models/productsList.model";
import { User } from "../../models/user.model";

fdescribe('Dropdown Mapper',()=>{
    const mockFranchises: Franchise[]=[
        {
            franchise_id:1,
            franchise_code:'FR-A',
            franchise_name:'Franchise A',
            therapeutic_areas:[
                {
                    ta_id:10,
                    ta_name:'TA A',
                    brands:[
                        {
                            brand_id:100,
                            brand_name:'Brand A',
                            products:[
                                {
                                    product_id: 1000,
                                    product_name: 'Product A',
                                    product_type: 'Type A'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ];
    const mockUser: User={
        roles:[
            {role_id:1,role_name:'Admin'}
        ],
        functions:[
            {function_id:10,function_name:'IT'}
        ]
    }as User;
    it('should map franchise to dropdown',()=>{
        const result=mapFranchisesToDropdown(mockFranchises);
        expect(result).toEqual([
            {id:1,name:'Franchise A'}
        ]);
    });
    it('should map TA to dropdowns',()=>{
        const result=mapTAsToDropdown(mockFranchises);
        expect(result).toEqual([
            {
            id:10,
            name:'TA A',
            franchise_id:1
            }
        ]);
    });
    it('should map brands to dropdowns',()=>{
        const result=mapBrandsToDropdown(mockFranchises);
        expect(result).toEqual([
            {
            id:100,
            name:'Brand A',
            franchise_id:1,
            ta_id:10
            }
        ]);
    });
    it('should map products to dropdown',()=>{
        const result=mapProductsToDropdown(mockFranchises);
        expect(result).toEqual([
            {
            id:1000,
            name:'Product A',
            franchise_id:1,
            ta_id:10,
            brand_id:100
            }
        ]);
    });
    it('should map roles to dropdowns',()=>{
        const result=mapRolesToDropdown(mockUser);
        expect(result).toEqual([
            {
            id:1,
            name:'Admin'          
            }
        ]);
    });
    it('should map functions to dropdowns',()=>{
        const result=mapFunctionsToDropdown(mockUser);
        expect(result).toEqual([
            {
            id:10,
            name:'IT'          
            }
        ]);
    });
    it('should map value list to dropdowns',()=>{
        const list=[
            { value_code:'A',value_label:'Option A'},
            { value_code:'B',value_label:'Option B'}
        ];
        const result=mapValueListToDropdown(list);
        expect(result).toEqual([
            {
            id:'A',
            name:'Option A'          
            },
            { id :'B',name:'Option B'}
        ]);
    });
    it('should generate RTI year dropdown',()=>{
        const result= getRtiYearDropdown(2);
        const currentYear=new Date().getFullYear()-1;
        expect(result).toEqual([
            { id: currentYear+1,name:String(currentYear+1)},
            {id:currentYear+2,name:String(currentYear+2)}
            // { id: currentYear+3,name:String(currentYear+3)},
            // {id:currentYear+4,name:String(currentYear+4)},
            // { id: currentYear+5,name:String(currentYear+5)}
           
        ]);
    });
    it('should return launch claim dropdown',()=>{
        const result=getLaunchClaimDropdown();
        expect(result).toEqual([
            {id:1,name:'Yes'},
            {id:2,name:'No'}
        ]);
    });
    it('should map research pathway to dropdown',()=>{
        const list=[
            { pathway_id:1,pathway_name:'Pathway A'}
        ];
        const result=mapResearchPathwayToDropdown(list);
        expect(result).toEqual([
            {id:1,name:'Pathway A'}
        ]);
    });
});