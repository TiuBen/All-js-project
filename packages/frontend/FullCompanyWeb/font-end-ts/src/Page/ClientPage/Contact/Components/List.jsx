function ListItem({ onClick, checked, disabled, title, subtitle, index }) {
      return (
          <li className="border mb-2 flex flex-row rounded-lg px-1">
              <input
                  id={"sss" + index}
                  type="radio"
                  className="disabled:text-slate-500 disabled:cursor-not-allowed peer"
                  onClick={onClick}
                  readOnly
                  checked={checked}
                  disabled={disabled}
              />
              <label
                  htmlFor={"sss" + index}
                  className="ml-2 flex flex-row flex-1 items-center justify-between peer-checked:text-blue-600  peer-disabled:cursor-not-allowed "
              >
                  <span className="text-xl font-semibold">{title}</span>
                  <span className="text-sm">{subtitle}</span>
              </label>
          </li>
      );
  }
  
 export default  function List({data,selectedItem , setSelectedItem,setEditorState, allDisabled}) {
      // 渲染数据
      return (
          <div className="min-w-96 p-2 gap-2 flex flex-col bg-zinc-50 rounded-lg shadow-md text-lg self-start overflow-hidden ">
              <div>
                  <input className="w-full border rounded-lg px-2 py-1" type="search" placeholder="搜索" />
              </div>
              <div>
                  <ul>
                      {data.map((item, index) => {
                          return (
                              <ListItem
                                  key={index}
                                  index={index}
                                  title={item.name}
                                  subtitle={item.company_name}
                                  checked={selectedItem === item}
                                  onClick={
                                     ()=>{
                                        setSelectedItem(item);
                                        setEditorState('select')
                                     }
                                  }
                                  disabled={allDisabled}
                              />
                          );
                      })}
                  </ul>
              </div>
          </div>
      );
  }
  
  