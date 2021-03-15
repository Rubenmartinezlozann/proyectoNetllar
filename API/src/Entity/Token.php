<?php

namespace App\Entity;

use App\Repository\TokenRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=TokenRepository::class)
 */
class Token
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $token;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $login_date;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $expiation_date;

    /**
     * @ORM\OneToOne(targetEntity=user::class, inversedBy="token", cascade={"persist", "remove"})
     */
    private $user;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(string $token): self
    {
        $this->token = $token;

        return $this;
    }

    public function getLoginDate(): ?string
    {
        return $this->login_date;
    }

    public function setLoginDate(?string $login_date): self
    {
        $this->login_date = $login_date;

        return $this;
    }

    public function getExpiationDate(): ?string
    {
        return $this->expiation_date;
    }

    public function setExpiationDate(?string $expiation_date): self
    {
        $this->expiation_date = $expiation_date;

        return $this;
    }

    public function getUser(): ?user
    {
        return $this->user;
    }

    public function setUser(?user $user): self
    {
        $this->user = $user;

        return $this;
    }
}
