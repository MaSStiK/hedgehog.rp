import { useState, useEffect, useContext } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { DataContext } from "../Context"
import ButtonProfile from "../ButtonProfile/ButtonProfile"
import Aside from "../Aside/Aside"
import imgBasePhoto from "../../assets/replace/base-photo-empty.png"
import { VKAPI } from "../API"
import { setPageTitle } from "../Global"

import "./PageUser.css"
import "./PageUser-phone.css"


export default function PageUser() {
    useEffect(() => {setPageTitle("Участник")}, [])
    const NavigateTo = useNavigate()
    const Context = useContext(DataContext)
    const URLparams = useParams()
    const isSelfRender = Context.userData ? Context.userData.id === URLparams.id : false

    const [userNotFound, setUserNotFound] = useState(false);
    const [showCopyMessage, setShowCopyMessage] = useState(false);
    
    const [userData, setUserData] = useState({});
    const [userDataVk, setUserDataVk] = useState({});

    function handleCopyButton() {
        navigator.clipboard.writeText(userData.tag)
        setShowCopyMessage(true)
        setTimeout(() => setShowCopyMessage(false), 2000)
    }

    function handleExitProfile() {
        delete localStorage.userData
        delete Context.userData
        NavigateTo("/")
        window.location.reload()
    }

    // Когда загрузились все юзеры
    useEffect(() => {
        if (!Object.keys(Context.users).length) {
            return
        }

        let foundUser = Context.users.find(user => user.id === URLparams.id)

        if (!foundUser) {
            setUserNotFound(true)
            setUserData({})
            setUserDataVk({})
            return
        }

        setUserData(foundUser)
        setPageTitle(foundUser.name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [URLparams.id, Context.users])

    useEffect(() => {
        setUserDataVk({})

        // Если юзер в кэше
        if (sessionStorage["vkUser" + URLparams.id]) {
            let hashVkUser = JSON.parse(sessionStorage["vkUser" + URLparams.id])
            setUserDataVk({
                photo: hashVkUser.photo,
                name: hashVkUser.name
            })
            return
        }

        // Находим информацию о пользователе в вк при изменении id поиска
        VKAPI("users.get", {user_id: URLparams.id, fields: "photo_200"}, (vkData) => {
            console.log("VKAPI: users.get");
            if (vkData.response.length) {
                vkData = vkData.response[0]

                // Сохраняем юзера
                sessionStorage["vkUser" + vkData.id] = JSON.stringify({
                    photo: vkData.photo_200,
                    name: `${vkData.first_name} ${vkData.last_name}`
                })

                setUserDataVk({
                    photo: vkData.photo_200,
                    name: `${vkData.first_name} ${vkData.last_name}`
                })
            }
        })
    }, [URLparams.id])

    return (
        <>
            <Aside />
            <article>
                <h4 className="page-title">/ Участник</h4>

                {/* Если юзер найден */}
                {Object.keys(userData).length
                    ? <section className="flex-col">
                        <div className="user-profile__top">
                            <div className="user-profile__top-photo">
                                <img src={userData.photo ? userData.photo : imgBasePhoto} alt="user-profile" />
                            </div>
                            <div className="user-profile__top-name">
                                <h2>{userData.name}</h2>
                                <p onClick={handleCopyButton} className="user-profile__top-tag text-cut text-gray">{showCopyMessage ? "Скопировано" : userData.tag}</p>
                            </div>
                        </div>

                        {/* Кнопка изменения страницы если отображается профиль владельда страницы */}
                        {isSelfRender &&
                            <Link to={"/users/edit"}>
                                <button className="green">Изменить профиль (Скоро)</button>
                            </Link>
                        }

                        {/* Кнопка выхода если отображается профиль владельда страницы */}
                        {isSelfRender &&
                            <button className="red" onClick={handleExitProfile}>Выйти из профиля</button>
                        }

                        <div className="divider"></div>
                        <div className="user-profile__row">
                            <p className="text-gray">ВКонтакте</p>
                            <Link to={`https://vk.com/id${userData.id}`} target="_blank">
                                <ButtonProfile
                                    className="tp"
                                    src={userDataVk.photo}
                                    text={userDataVk.name}
                                />
                            </Link>
                        </div>
                        
                        {/* Если есть страна - отображаем */}
                        {userData.country_id &&
                            <>
                                <div className="divider"></div>
                                <div className="user-profile__row">
                                    <p className="text-gray">Страна</p>
                                    <Link to={`/countries/${userData.country_id}`}>
                                        <ButtonProfile
                                            className="tp"
                                            src={userData.country_photo}
                                            text={userData.country_title}
                                        />
                                    </Link>
                                </div>
                            </>
                        }
                        

                        {/* Если есть описание - отображаем */}
                        {userData.bio &&
                            <>
                                <div className="divider"></div>
                                <div className="flex-col">
                                    <p className="text-gray">О себе</p>
                                    <p className="textarea-block">{userData.bio}</p>
                                </div>
                            </>
                        }
                    </section>
                    
                    // Если пользователь не найден, будет показан только когда будет ошибка
                    : <> 
                        {userNotFound &&
                            <section className="flex-col">
                                <h2>Участник не найден!</h2>
                                <Link to={"/users"}>
                                    <button>К списку участников</button>
                                </Link>
                            </section>
                        }
                    </>
                }

            </article>
        </>
    )
}
