import React, { Component } from 'react';
import cytomaster from 'cytoscape';
import cydagre from 'cytoscape-dagre';
import './App.css';
import axios from 'axios';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import popper from 'cytoscape-popper';
import contextMenus from 'cytoscape-context-menus';
import 'cytoscape-context-menus/cytoscape-context-menus.css';

cydagre(cytomaster);
let cyStyle = {
    height: '1000px',
    display: 'block'
};

if (typeof cytomaster('core', 'contextMenus') !== 'function') {
  cytomaster.use(contextMenus);
}


if (typeof cytomaster('core', 'popper') !== 'function') {
  cytomaster.use(popper);
}

class Cytomaster extends Component {
    constructor(props) {
        super(props);
        this.state = { 
        cy: {},
        partID:" ",
        showGraph:false,
        Allnodes:[],
        Alledges:[],
        imageStyle:[],
        conf: {
          boxSelectionEnabled: false,
          autounselectify: true,
          zoomingEnabled: true,
          style: this.imageStyle, 
          elements:{
            nodes: [],
            edges: []
          },
          layout: {
              name: 'dagre'
         }
        } 
       }
    }


    makePopper(ele){
      let ref = ele.popperRef(); // used only for positioning
      //console.log(ref)
      let dummyDomEle = document.createElement('div');
      ele.tip = new tippy(dummyDomEle, { // tippy options:
      trigger: 'manual', // call show() and hide() yourself
      lazy: false, // needed for onCreate()
      multiple: true,
      sticky: true,
      boundary: 'viewport',
      interactive: true,
      appendTo: document.body,
      getReferenceClientRect: ref.getBoundingClientRect,
      content: () => {
          let content = document.createElement('div');
          content.innerHTML = ele.data('id');
          return content;
        }
      });
    }


    afterMount() {
      this.state.conf.container = this.cyRef;
      var self = this
      let cy = cytomaster(this.state.conf);
      cy.style(this.state.imageStyle)

      cy.pan({ x: 40, y: -350 });
      cy.elements().forEach(function(ele) {
        self.makePopper(ele);
      });
      cy.elements().unbind("click");
      cy.elements().bind("click", event => event.target.tip.show()); 
      var cStyle=this.state.imageStyle;
      var removed = [];
     cy.contextMenus({
        menuItems: [
          {
            id: 'analyse_this_node',
            content: 'Analyse This Node',
            tooltipText: 'Analyse This Node',
            selector: 'node',
            onClickFunction: function (event) {
                var all_nodes=cy.elements()
                for(var index in all_nodes){
                  if(!isNaN(index)){
                    if(all_nodes[index].data().id !== event.target.data().id){
                      removed.push(all_nodes[index].remove());
                    }
                  }
                }
                

                cy.style(cStyle)
            },
            hasTrailingDivider: true
          },
          {
            id: 'show_children',
            content: 'Show Children',
            tooltipText: 'Show Children',
            selector: 'node',
            onClickFunction: function (e) {
              debugger;
                
           
                var node_data = [];
                var edge_data = [];
            self.state.Alledges.map(m => {
                  if(m.data.source === e.target.data().id){
                edge_data.push(m);                               
                }
        })
                edge_data.map(n=>{
                    self.state.Allnodes.map(m => {
                   
                        if(n.data.target === m.data.id){
                          node_data.push(m);                               
                  }
                })
        })
               
 
       
       
                          for(var index in node_data){
                              
                            cy.add([
                              { group: 'nodes', data: node_data[index].data, position:{ x: e.target.position().x + [index-1]*6, y: e.target.position().y + 6 }  }
                          ]);
                          }
                          for(var index in edge_data){
                            cy.add([
                              { group: 'edges', data: edge_data[index].data }
                          ]);
                          }
                          
                          cy.elements().forEach(function(ele) {
                            self.makePopper(ele);
                          });
                          cy.elements().unbind("click");
                          cy.elements().bind("click", event => event.target.tip.show()); 
                        
            },
            
            hasTrailingDivider: true
          },
          {
            id: 'show_parents',
            content: 'Show Parents',
            tooltipText: 'Show Parents',
            selector: 'node',
            onClickFunction: function (e) {
             
               
                var node_data = [];
                var edge_data = [];
             
                self.state.Alledges.map(m => {
                            if(m.data.target === e.target.data().id){
                          edge_data.push(m);                               
                          }
                  })
                  edge_data.map(n=>{
                    self.state.Allnodes.map(m => {
                        if(n.data.source ===m.data.id){
                          node_data.push(m);                               
                  }
                })
        })
                
                  
                          for(var index in node_data){
                            cy.add([
                              { group: 'nodes', data: node_data[index].data, position: { x: e.target.position().x + index*0.5, y: e.target.position().y - 6 } }
                          ]);
                          }
                          for(var index in edge_data){
                            cy.add([
                              { group: 'edges', data: edge_data[index].data }
                          ]);
                          }
                          cy.elements().forEach(function(ele) {
                            self.makePopper(ele);
                          });
                          cy.elements().unbind("click");
                          cy.elements().bind("click", event => event.target.tip.show()); 
                         
                       
            },
            
            hasTrailingDivider: true
          },
         
         
         ]
      });
      
}


    
    handleChangePartID=(e)=>{
       
    
      const id=e.target.value;
      this.setState({partID:id.trim()});
      this.setState({showGraph:true})

    
    }

    handleChangeSubmit=(e)=>{


      var url='./data.json';
           
      
      axios
      .get(url)
      .then(response => {
      
        const nodes = response.data.elements.nodes;
        const edges = response.data.elements.edges;
        const styles = response.data.elements.style;

        var node=[];
        nodes.map((c)=>{
          if(c.data.id === this.state.partID){
            node.push({data:c.data})
          }});
      console.log(node);

       this.setState({Allnodes:nodes});
       this.setState({Alledges:edges});
       this.setState({imageStyle:styles});

       
        this.setState(prevState => ({
          ...prevState,
          conf: {
              ...prevState.conf,
              elements: {
                  ...prevState.conf.elements, 
                 nodes: node,
                 edges:[],
                
              }
          }
      }))
   
   
      this.afterMount();
    
      
        
      })
      .catch( (error)=> {
      
        console.log(error);
       
      
    })
  }
  
    render() {
        return (
        <div>
        <div className="IDname">
        <label className='label2'>ID *</label>
        <div className="input-group  mb-3">
           <input type="text" className="form-control" aria-describedby="basic-addon2"
             value={this.state.partID}
             onChange={this.handleChangePartID}
            />
          <button className="btn btn-outline-secondary"  type="button"  onClick={this.handleChangeSubmit}>Submit</button>
        </div>
        <br/>
            <span>
              Enter the Node_01 or any in public/data.json 
            <br/>
              Press Submit (click twice some issue)
            <br/>
              Right click on visible node to see menu option to expand its children, parents and to analyse node. <br/>
              Click on node to see node number
            </span>
          </div>
       {this.state.showGraph &&
        <div style={cyStyle} ref={(cyRef) => {
            this.cyRef = cyRef;
        }}/>
      }
        </div>
      
        )
    }
  
}

export default Cytomaster;
