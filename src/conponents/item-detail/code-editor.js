/* ----------------- Обработка событий ComboDlg ----------------------------------- */
export const handleComboDlgBeginEdit = ({ row }) => {
    this.setState({
        editingCode: row.code
    })

};

export const handleComboDlgEndEdit = ({ row }) => {
    this.setState({
        editingCode: null
    })
};

export const handleComboDlgCancelEdit = ({ row }) => {
    this.setState({
        editingCode: null
    })
};

// Методы для редактирования кодов
export const handleClickAddCode = () =>{
    console.log(this.state.editingData);
    const { editingData } = this.state;
    const newData = [{ code: "0" }];
    this.setState({
        editingData: newData.concat(editingData)
    })
};

export const handleClickRemoveCode = () => {

};

export const handleComboDlgClose = () => {
    this.setState({ comboDlgClosed: true })
};