import { useEffect, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { DataContext } from "../Context"
import Aside from "../Aside/Aside"
import PostsRender from "../PostsRender/PostsRender"
import { setPageTitle } from "../Global"

import "./PageHome.css"
import "./PageHome-phone.css"


export default function PageHome() {
    useEffect(() => {setPageTitle("Главная")}, [])
    const NavigateTo = useNavigate()
    const Context = useContext(DataContext)

    const imgVkGroup = "https://sun9-60.userapi.com/impg/oEWyVY7z0mShE_4NiWZjLJRUtlblNoS-p0Ph4Q/6rgXOaV54GI.jpg?size=1080x1021&quality=95&sign=7521bfdf054e784b2b37a022c4ec2fdf&type=album"
    const imgYoutubeChannel = "https://sun9-75.userapi.com/impg/InAN-EkKVY2m_b5O35GiDeI1MEJDkpI6a8Rr4A/e6KrwnAUh-w.jpg?size=176x176&quality=96&sign=3c161604cc42ae88ab597906173bff60&type=album"


    function navigateToNews() {
        // sessionStorage.scrollToNews = post_id
        NavigateTo("/news")
    }

    return (
        <>
            <Aside />

            <article>
                <h4 className="page-title">/ Главная</h4>

                <section className="flex-row">
                    <Link className="home__link-wrapper" to="https://vk.com/hedgehogs_army" target="_blank">
                        <img src={imgVkGroup} alt="link-vk" />
                        <h3>Наша группа в ВК</h3>
                    </Link>

                    <Link className="home__link-wrapper" to="https://www.youtube.com/@hedgehogs_army" target="_blank">
                        <img src={imgYoutubeChannel} alt="link-youtube" />
                        <h3>Мы в Youtube</h3>
                    </Link>
                </section>

                <section className="flex-col">
                    <h2>Последнее видео на канале</h2>
                    <iframe width="520" height="280" src="https://www.youtube.com/embed/x2gx7yKC54s?si=DUBOXLomABWx7FLY" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                </section>

                <PostsRender
                    posts={[...Context.posts].slice(0, 5)}
                    users={Context.users}
                />

                <section>
                    <button onClick={navigateToNews}>Больше новостей</button>
                </section>
            </article>

            {/* Сделать квадрат с генерируемым текстом из нулей и единиц в буквы ("Скоро") */}
        </>
    )
}
