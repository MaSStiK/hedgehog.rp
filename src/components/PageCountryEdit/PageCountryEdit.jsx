import { useEffect, useContext, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { DataContext } from "../Context"
import CustomInput from "../CustomInput/CustomInput"
import Aside from "../Aside/Aside"
import { CONSTS, setPageTitle, setPageLoading } from "../Global"
import { GSAPI } from "../API";


import "./PageCountryEdit.css"

export default function PageCountryEdit() {
    useEffect(() => {setPageTitle(Context.userData.country_id ? "Изменение страны" : "Создание страны")}, [])
    const Context = useContext(DataContext)
    const NavigateTo = useNavigate()

    const [countryBioMainLength, setCountryBioMainLength] = useState(0);
    const [countryBioMoreLength, setCountryBioMoreLength] = useState(0);
    const [countryPhotoPreview, setCountryPhotoPreview] = useState("")

    const [errorText, setErrorText] = useState("") // Текст ошибки
    const [titleInputError, setTitleInputError] = useState(false) // Отображать ли ошибку инпута Названия страны
    const [tagInputError, setTagInputError] = useState(false) // Отображать ли ошибку инпута Названия страны
    const [bioMainInputError, setBioMainInputError] = useState(false) // Отображать ли ошибку инпута Описания
    const [bioMoreInputError, setBioMoreInputError] = useState(false) // Отображать ли ошибку инпута Доп Описания
    const [photoInputError, setPhotoInputError] = useState(false) // Отображать ли ошибку инпута Ссылка на фото
    const [disableSubmitButton, setDisableSubmitButton] = useState(true) // Отключить ли кнопку сохранения

    const basePhotoSrc = "https://is.gd/fzchSz" // Сокращенная ссылка на базовое фото

    const countryTitleInput = useRef()
    const countryTagInput = useRef()
    const countryPhotoInput = useRef()
    const countryBioMainInput = useRef()
    const countryBioMoreInput = useRef()

    useEffect(() => {
        countryTitleInput.current.value = Context.userData.country_title
        countryTagInput.current.value = Context.userData.country_tag

        countryPhotoInput.current.value = Context.userData.country_photo
        checkImageSource(countryPhotoInput.current.value) // Обновляем превью картинки

        // countryBioMainInput.current.value = Context.userData.country_bio_main.replaceAll("<br>","\n")
        countryBioMainInput.current.value = Context.userData.country_bio_main
        setCountryBioMainLength(countryBioMainInput.current.value.length) // Обновляем значение длины описания

        // countryBioMoreInput.current.value = Context.userData.country_bio_more.replaceAll("<br>","\n")
        countryBioMoreInput.current.value = Context.userData.country_bio_more
        setCountryBioMoreLength(countryBioMoreInput.current.value.length) // Обновляем значение длины доп описания
        
        handleInputUpdate()
    }, [Context.userData])


    // Проверка существования картинки
    function checkImageSource(src) {
        if (src) {
            const img = new Image();
            img.src = src;
            
            img.onload = () => {
                if (img.naturalWidth < CONSTS.photoPxMin // Если картинка больше или меньше заданных значений
                    || img.naturalHeight < CONSTS.photoPxMin
                    || img.naturalWidth > CONSTS.photoPxMax
                    || img.naturalHeight > CONSTS.photoPxMax) {
                    setErrorText("Не удалось загрузить картинку")
                    setCountryPhotoPreview("")
                    setPhotoInputError(true)
                    return
                }

                // Если размер подходит - ставим превью
                setCountryPhotoPreview(src)
            }

            img.onerror = () => {
                setErrorText("Не удалось загрузить картинку")
                setCountryPhotoPreview("")
                setPhotoInputError(true)
            }
        } else {
            setCountryPhotoPreview("")
        }
    }


    // При обновлении любого из инпутов
    function handleInputUpdate() {
        setErrorText("")
        setTitleInputError(false)
        setTagInputError(false)
        setBioMainInputError(false)
        setBioMoreInputError(false)
        setPhotoInputError(false)
        setDisableSubmitButton(countryTitleInput.current.value.length < CONSTS.countryTitleMin) // Если меньше 1 символа в названии страны
        
        countryTagInput.current.value = countryTagInput.current.value.replaceAll(" ", "_")
    }

    // Ивент submit у формы создания/изменения страны
    function submitForm() {
        handleInputUpdate() // Сброс всех ошибок

        let formTitle = countryTitleInput.current.value
        let formTag = countryTagInput.current.value
        let formPhoto = countryPhotoInput.current.value
        let formBioMain = countryBioMainInput.current.value
        let formBioMore = countryBioMoreInput.current.value


        // Проверка длины Названия
        if (formTitle.length < CONSTS.countryTitleMin || formTitle.length > CONSTS.countryTitleMax) {
            setErrorText(formTitle.length < CONSTS.countryTitleMin
                ? `Название меньше ${CONSTS.countryTitleMin} символов`
                : `Название больше ${CONSTS.countryTitleMax} символов`
            )
            setTitleInputError(true)
            return
        }


        // Проверка длины тега
        if (formTag.length > CONSTS.countryTagMax + 1) {
            setErrorText(`Тег больше ${CONSTS.countryTagMax} символов`)
            setTagInputError(true)
            return
        }

        // Проверка наличия запрещенных символов
        try {
            btoa(formTag)
        } catch {
            setErrorText(`Тег содержит запрещенные символы`)
            setTagInputError(true)
            return
        }

        // Если тег пустой - ставим по умолчанию
        if (!formTag) {
            formTag = "@c" + Context.userData.id
        }


        // Проверка длины фото
        if (formPhoto.length > CONSTS.photoMax) {
            setErrorText(`Ссылка на картинку больше ${CONSTS.photoMax} символов`)
            setPhotoInputError(true)
            return
        }

        // Если фото пустое - загружаем стандартное
        if (!countryPhotoPreview) {
            formPhoto = basePhotoSrc
        }


        // Проверка длины описания
        if (formBioMain.length > CONSTS.countryBioMainMax) {
            setErrorText(`Описание больше ${CONSTS.countryBioMainMax} символов`)
            setBioMainInputError(true)
            return
        }


        // Проверка длины доп описания
        if (formBioMore.length > CONSTS.countryBioMoreMax) {
            setErrorText(`Доп. описание больше ${CONSTS.countryBioMoreMax} символов`)
            setBioMoreInputError(true)
            return
        }

        
        // Отключаем кнопку только в случае если прошло все проверки
        setDisableSubmitButton(true)
        setPageLoading()

        // Обновленные данные о стране
        let newCountryData = {
            country_id: "c" + Context.userData.id, // Уникальный id страны
            country_tag: formTag, // Тег для упрощенного поиска
            country_title: formTitle, // Отображаемое название страны
            country_bio_main: formBioMain, // Описание страны
            country_bio_more: formBioMore, // Доп описание страны
            country_photo: formPhoto, // Флаг страны
        }

        // LINKAPI(formPhoto, (data) => {
        //     // Если получилось сократить ссылку - сохраняем ее
        //     newCountryData.country_photo = data

        //     // После чего начинаем отправки информации
        //     sendData(newCountryData)
        // })

        sendData(newCountryData)
        


        function sendData() {
            let countryDataNoBio = {...newCountryData}
            delete countryDataNoBio.country_bio_main
            delete countryDataNoBio.country_bio_more

            // Всю главную информацию отправляем всегда
            GSAPI("PUTcountry", {token: Context.userData.token, data: JSON.stringify(countryDataNoBio)}, (data) => {
                console.log("GSAPI: PUTcountry");
    
                // Если тег не уникальный
                if (!data.success || !Object.keys(data).length) {
                    setErrorText("Введенный тег занят")
                    setTagInputError(true)
                    setDisableSubmitButton(false)
                    setPageLoading(false)
                    return
                }

                sendCountryBioMain()
            })
        }

        function sendCountryBioMain() {
            // Если главное описание не менялось - проверка доп описания
            if (newCountryData.country_bio_main === Context.userData.country_bio_main) {
                sendCountryBioMore()
                return
            }

            // Если доп описание поменялось - отправляем изменения
            GSAPI("PUTcountryBioMain", {token: Context.userData.token, country_bio_main: newCountryData.country_bio_main}, (data) => {
                console.log("GSAPI: PUTcountryBioMain");

                if (!data.success || !Object.keys(data).length) {
                    setErrorText("Не удалось сохранить описание")
                    setBioMainInputError(true)
                    setDisableSubmitButton(false)
                    setPageLoading(false)
                    return
                }

                // После отправки главного описания проверяем нужно ли отправить доп описание
                sendCountryBioMore()
                return
            })
        }

        function sendCountryBioMore() {
            // Если доп описание не менялось - сохраняем информацию
            if (newCountryData.country_bio_more === Context.userData.country_bio_more) {
                saveCountryData()
                return
            }

            // Если доп описание поменялось - отправляем изменения
            GSAPI("PUTcountryBioMore", {token: Context.userData.token, country_bio_more: formBioMore}, (data) => {
                console.log("GSAPI: PUTcountryBioMore");

                if (!data.success || !Object.keys(data).length) {
                    setErrorText("Не удалось сохранить доп. описание")
                    setBioMoreInputError(true)
                    setDisableSubmitButton(false)
                    setPageLoading(false)
                    return
                }

                // После отправки доп описания сохраняем информацию
                saveCountryData()
            })
        }


        // Сохранение информации локально
        function saveCountryData() {
            let newUserData = {...Context.userData}
            newUserData.country_id = newCountryData.country_id
            newUserData.country_tag = newCountryData.country_tag
            newUserData.country_title = newCountryData.country_title
            newUserData.country_bio_main = formBioMain
            newUserData.country_bio_more = formBioMore
            newUserData.country_photo = newCountryData.country_photo

            localStorage.userData = JSON.stringify(newUserData)
            Context.setUserData(newUserData)

            // Удаляем старого юзера и загружаем нового
            let usersWithoutUser = Context.users.filter((user) => {return user.id !== Context.userData.id})
            usersWithoutUser.push(newUserData)
            Context.setUsers(usersWithoutUser)

            setPageLoading(false)
            NavigateTo("/countries/" + newCountryData.country_id)
        }
    }

    return (
        <>
            <Aside />

            <article>
                {/* Добавить изменение надписи на "Создание страны" если страна у юзера пустая */}
                <h4 className="page-title">{`/ ${Context.userData.country_id ? "Изменение" : "Создание"} страны`}</h4>

                <section className="flex-col country-edit">
                    <CustomInput label="ID Страны">
                        <input
                            type="text"
                            id="form-id"
                            value={Context.userData.country_id ? Context.userData.country_id : "c" + Context.userData.id}
                            readOnly
                            required
                        />
                    </CustomInput>

                    <CustomInput label="Название страны">
                        <input
                            ref={countryTitleInput}
                            type="text"
                            id="form-title"
                            className={titleInputError ? "error" : null}
                            maxLength={CONSTS.countryTitleMax}
                            onInput={handleInputUpdate}
                            required
                        />
                    </CustomInput>
                    <small>Длина названия от {CONSTS.countryTitleMin} до {CONSTS.countryTitleMax} символов</small>

                    <CustomInput label="Тег страны">
                        <input
                            ref={countryTagInput}
                            type="text"
                            id="form-tag"
                            className={tagInputError ? "error" : null}
                            maxLength={CONSTS.countryTagMax + 1}
                            onInput={handleInputUpdate}
                            onFocus={() => {
                                // Если при нажатии нету символов - добавляем @ в начало
                                if (!countryTagInput.current.value) {
                                    countryTagInput.current.value = "@"
                                }
                            }}
                            onBlur={() => {
                                // Если остался только символ @ - удаляем его
                                if (countryTagInput.current.value === "@") {
                                    countryTagInput.current.value = ""
                                }

                                // Если строка не пустая, но начинается не с @ - добавляем в начало и обрезаем строку
                                if (countryTagInput.current.value && !countryTagInput.current.value.startsWith("@")) {
                                    countryTagInput.current.value = "@" + countryTagInput.current.value.slice(0, CONSTS.countryTagMax)
                                }
                            }}
                            required
                        />
                    </CustomInput>
                    <small>Без пробелов<br/>Длина тега до {CONSTS.countryTagMax} символов<br/>Только латиница, цифры и спецсимволы</small>

                    <CustomInput label="Ссылка на флаг страны">
                        <input
                            ref={countryPhotoInput}
                            type="text"
                            id="form-photo"
                            className={photoInputError ? "error" : null}
                            maxLength={CONSTS.photoMax}
                            onInput={() => {
                                checkImageSource(countryPhotoInput.current.value) // Проверяем картинку
                                handleInputUpdate() // Так же обновляем все поля
                            }}
                            required
                        />
                    </CustomInput>

                    <small>Длина ссылки до {CONSTS.photoMax} символов<br/>Размер картинки от {CONSTS.photoPxMin}px/{CONSTS.photoPxMin}px до {CONSTS.photoPxMax}px/{CONSTS.photoPxMax}px<br/>Замена на стандартную картинку если поле пустое</small>
                    {countryPhotoPreview &&
                        <img src={countryPhotoPreview} alt="preview" />
                    }
                    
                    <CustomInput label={`Описание страны (${countryBioMainLength} / ${CONSTS.countryBioMainMax})`}>
                        <textarea
                            ref={countryBioMainInput}
                            id="form-bio"
                            className={bioMainInputError ? "error" : null}
                            maxLength={CONSTS.countryBioMainMax}
                            onInput={() => {
                                setCountryBioMainLength(countryBioMainInput.current.value.length) // Обновляем значение длины описания
                                handleInputUpdate() // Так же обновляем все поля
                            }}
                            required 
                        ></textarea>
                    </CustomInput>
                    <small>Длина описания до {CONSTS.countryBioMainMax} символов</small>

                    <CustomInput label={`Доп. описание (${countryBioMoreLength} / ${CONSTS.countryBioMoreMax})`}>
                        <textarea
                            ref={countryBioMoreInput}
                            id="form-bio"
                            className={bioMoreInputError ? "error" : null}
                            maxLength={CONSTS.countryBioMoreMax}
                            onInput={() => {
                                setCountryBioMoreLength(countryBioMoreInput.current.value.length) // Обновляем значение длины доп описания
                                handleInputUpdate() // Так же обновляем все поля
                            }}
                            required 
                        ></textarea>
                    </CustomInput>
                    <small>Доп. описание до {CONSTS.countryBioMoreMax} символов</small>
                    
                    {errorText &&
                        <p className="text-red">{errorText}</p>
                    }

                    <button onClick={submitForm} disabled={disableSubmitButton} className="green">Сохранить</button>
                </section>
            </article>
        </>
    )
}
