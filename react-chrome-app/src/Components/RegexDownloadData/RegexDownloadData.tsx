import React, { useState } from 'react';


export interface RegexData {
    uuid: string;
    name: string;
    regexes: string[];
    domains: string[];
    path: string;
    enabled: boolean;
    order: number;
    shouldStop: boolean;
}

export interface RegexDownloadDataProps {
    regexData: RegexData[];
}


function getRegexData() {
    const regexData = localStorage.getItem('regexDataList');
    if (regexData) {
        const parsedRegexData: { data: RegexData[] } = JSON.parse(regexData);
        return parsedRegexData.data.sort((a, b) => a.order - b.order);
    }
    return [];
}

function getFolderList(regexData: RegexData[]): { [key: string]: RegexData[] } {
    const folderList = {} as { [key: string]: RegexData[] };
    for (const regexDataItem of regexData) {
        if (folderList[regexDataItem.path] == null) {
            folderList[regexDataItem.path] = [];
        }

        folderList[regexDataItem.path].push(regexDataItem);
    }
    return folderList;
}

import folderListStyles from './folderlist.module.css';

export function FolderList({ regexData, onUpdateRule }: { regexData: RegexData[], onUpdateRule: () => void }) {

    const [currentSelectedFolder, setCurrentSelectedFolder] = useState("");
    const [selectedRule, setSelectedRule] = useState<RegexData | null>(null);
    const [validationErrors, setValidationErrors] = React.useState<string[]>([]);

    if (regexData.length === 0) {
        return <div>Click the add button to add a new rule</div>
    }

    const folderList = getFolderList(regexData);

    const updateRegexData = (regexData: RegexData[]) => {
        localStorage.setItem('regexDataList', JSON.stringify({ data: regexData }));
    }

    return (
        <div>
            {
                Object.keys(folderList).map(folder => {
                    return (
                        <div className={folderListStyles.list_item_container}>
                            <div className={folderListStyles.list_item} onClick={() => {
                                setCurrentSelectedFolder(folder === currentSelectedFolder ? "" : folder);
                            }}>
                                <div className={folderListStyles.list_item__left}>
                                    <i className="fa fa-folder-open" aria-hidden="true"></i>
                                    <p>{folder}</p>
                                    <p>({folderList[folder].length} rule{folderList[folder].length > 1 ? "s" : ""})</p>
                                </div>
                            </div>
                            {
                                currentSelectedFolder === folder && (
                                    <div>
                                        <ul className={folderListStyles.list_rule}>
                                            {
                                                folderList[folder].map((regexDataItem) => {
                                                    const classes = [];
                                                    if (regexDataItem.enabled === false) {
                                                        classes.push(folderListStyles.list_rule_item__disabled);
                                                    }
                                                    return (
                                                        <li className={classes.join(",")} >
                                                            <div className={folderListStyles.list_rule_item} onClick={() => {
                                                                setSelectedRule(regexDataItem === selectedRule ? null : regexDataItem);
                                                            }}>
                                                                <div className={folderListStyles.list_item__left}>
                                                                    <i className="fa fa-file" aria-hidden="true"></i>
                                                                    <p>{regexDataItem.name}</p>
                                                                </div>

                                                                <button className={folderListStyles.list_rule_item__delete} onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const newRegexData = [...regexData];
                                                                    const index = newRegexData.findIndex(item => item.uuid === regexDataItem.uuid);
                                                                    newRegexData.splice(index, 1);
                                                                    updateRegexData(newRegexData);
                                                                    onUpdateRule();
                                                                }}>Delete</button>


                                                            </div>

                                                            {selectedRule?.uuid === regexDataItem.uuid &&
                                                                <div className={folderListStyles.list_rule_regex_edit}>
                                                                    <RegexRule
                                                                        regexData={selectedRule}
                                                                        onChange={(data) => {
                                                                            const newRegexData = [...regexData];
                                                                            const index = newRegexData.findIndex(item => item.uuid === data.uuid);
                                                                            newRegexData[index] = data;
                                                                            updateRegexData(newRegexData);
                                                                        }}
                                                                        onValidate={(data) => {
                                                                            const errors: string[] = [];
                                                                            console.log(data);
                                                                            if (data.name === "") {
                                                                                errors.push("Name is required");
                                                                            }
                                                                            if (data.regexes.length === 0) {
                                                                                errors.push("At least one regex is required");
                                                                            }
                                                                            if (data.path === "") {
                                                                                errors.push("Path is required");
                                                                            }

                                                                            if (errors.length > 0) {
                                                                                setValidationErrors(errors);
                                                                                return;
                                                                            } else {
                                                                                setValidationErrors([]);
                                                                            }

                                                                            // find inside list of rules if there is already a rule with the same uuid
                                                                            const index = regexData.findIndex(item => item.uuid === data.uuid);
                                                                            if (index !== -1) {
                                                                                regexData[index] = data;
                                                                            } else {
                                                                                regexData.push(data);
                                                                            }

                                                                            updateRegexData(regexData);
                                                                            onUpdateRule();
                                                                            setSelectedRule(null);
                                                                        }} />
                                                                    <ul>
                                                                        {
                                                                            validationErrors.map(error => {
                                                                                return (
                                                                                    <li>{error}</li>
                                                                                )
                                                                            })
                                                                        }
                                                                    </ul>
                                                                </div>
                                                            }

                                                        </li>
                                                    )
                                                })
                                            }
                                        </ul>
                                    </div>)
                            }
                        </div>

                    )
                })
            }
        </div>
    )

}

export function ListAddAndRemovable({ list, onChange }: { list: string[], onChange: (list: string[]) => void }) {
    const [listItems, setListItems] = useState(list);

    const onChangeHandler = (newList: string[]) => {
        setListItems(newList);
        onChange(newList);
    }

    return (
        <div className='input_with_label__input'>
            {
                listItems.map((item, index) => {
                    return (
                        <div className='input_with_label'>
                            <input className='input_with_label__input' type="text" value={item} onChange={(e) => {
                                const newList = [...listItems];
                                newList[index] = e.target.value;
                                onChangeHandler(newList);
                            }} />
                            <button onClick={() => {
                                const newList = [...listItems];
                                newList.splice(index, 1);
                                onChangeHandler(newList);
                            }}>Remove</button>
                        </div>
                    )
                })
            }
            <button onClick={() => {
                const newList = [...listItems];
                newList.push("");
                onChangeHandler(newList);
            }}>Add</button>
        </div>
    )
}

export function RegexRule({ regexData, onChange, onValidate }: { regexData: RegexData, onChange: (data: RegexData) => void, onValidate: (data: RegexData) => void }) {
    const [name, setName] = useState(regexData.name);
    const [regexes, setRegexes] = useState(regexData.regexes);
    const [domains, setDomains] = useState(regexData.domains);
    const [path, setPath] = useState(regexData.path);

    const [currentData, setCurrentData] = useState(regexData);

    const onChangeHandler = (newData: RegexData) => {
        setCurrentData(newData);
        console.log(newData);
        onChange(newData);
    }

    return (
        <div>
            <div className='input_with_label'>
                <label>Name</label>
                <input className='input_with_label__input' type="text" value={name} onChange={(e) => {
                    setName(e.target.value);
                    onChangeHandler({
                        ...currentData,
                        name: e.target.value
                    })
                }} />
            </div>

            <div className='input_with_label'>
                <label>Regexes</label>
                <ListAddAndRemovable list={regexes} onChange={(newList) => {
                    setRegexes(newList);
                    onChangeHandler({
                        ...currentData,
                        regexes: newList
                    })
                }} />
            </div>
            <div className='input_with_label'>
                <label>Domains</label>
                <ListAddAndRemovable list={domains} onChange={(newList) => {
                    setDomains(newList);
                    onChangeHandler({
                        ...currentData,
                        domains: newList
                    })
                }} />
            </div>
            <div className='input_with_label'>
                <label>Path</label>
                <input className='input_with_label__input' type="text" value={path} onChange={(e) => {
                    setPath(e.target.value);
                    console.log(e.target.value);
                    onChangeHandler({
                        ...currentData,
                        path: e.target.value
                    })
                }} />
            </div>
            <div>
                <button onClick={() => {
                    onValidate(currentData);
                }}>Validate</button>
            </div>
        </div>
    )
}

export default () => {

    const [regexData, setRegexData] = React.useState<RegexData[]>(getRegexData());
    const [selectedFolder, setSelectedFolder] = React.useState<string>("");
    const [selectedRule, setSelectedRule] = React.useState<RegexData | null>(null);
    const [validationErrors, setValidationErrors] = React.useState<string[]>([]);


    const updateRegexData = (regexData: RegexData[]) => {
        setRegexData(regexData);
        localStorage.setItem('regexDataList', JSON.stringify({ data: regexData }));
    }

    return (
        <div>
            <div className="buttons">
                {
                    <button onClick={() => {
                        setSelectedRule({
                            uuid: crypto.randomUUID(),
                            name: "My Rule",
                            regexes: [],
                            domains: [],
                            path: "",
                            enabled: true,
                            order: 0,
                            shouldStop: false
                        })
                        setSelectedFolder("");
                    }}>Add a new rule</button>
                }
            </div>
            <div>
                {
                    selectedFolder !== "" && selectedRule === null ? null : <FolderList regexData={regexData} onUpdateRule={() => {
                        setRegexData(getRegexData());
                    }} />
                }
                {
                    selectedFolder === "" && selectedRule !== null ?
                        <div>
                            <RegexRule
                                regexData={selectedRule}
                                onChange={(data) => {
                                    const newRegexData = [...regexData];
                                    const index = newRegexData.findIndex(item => item.uuid === data.uuid);
                                    newRegexData[index] = data;
                                    updateRegexData(newRegexData);
                                }}
                                onValidate={(data) => {
                                    const errors: string[] = [];
                                    console.log(data);
                                    if (data.name === "") {
                                        errors.push("Name is required");
                                    }
                                    if (data.regexes.length === 0) {
                                        errors.push("At least one regex is required");
                                    }
                                    if (data.path === "") {
                                        errors.push("Path is required");
                                    }

                                    if (errors.length > 0) {
                                        setValidationErrors(errors);
                                        return;
                                    } else {
                                        setValidationErrors([]);
                                    }

                                    // find inside list of rules if there is already a rule with the same uuid
                                    const index = regexData.findIndex(item => item.uuid === data.uuid);
                                    if (index !== -1) {
                                        regexData[index] = data;
                                    } else {
                                        regexData.push(data);
                                    }

                                    updateRegexData(regexData);
                                    setSelectedRule(null);
                                }} />
                            <ul>
                                {
                                    validationErrors.map(error => {
                                        return (
                                            <li>{error}</li>
                                        )
                                    })
                                }
                            </ul>
                        </div>

                        : null
                }

            </div>
        </div>
    )

}